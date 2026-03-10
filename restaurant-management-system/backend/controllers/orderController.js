import Order from '../models/Order.js';
import User from '../models/User.js';
import { getIO } from '../socket.js';

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
export const getAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    const query = {};

    if (status) {
      query.status = status;
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const orders = await Order.find(query)
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean()
      .exec();

    const processedOrders = orders.map(order => ({
      ...order,
      tableNumber: order.tableNumber
    }));

    const count = await Order.countDocuments(query);

    res.json({
      orders: processedOrders,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      totalOrders: count
    });
  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    console.log('Updating order status:', req.params.id, 'to', status);

    const validStatuses = ['pending', 'preparing', 'ready', 'completed', 'cancelled', 'confirmed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status, ...(status === 'completed' && { completedAt: Date.now() }) },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    console.log('Order updated successfully:', order._id);

    // Emit real-time update
    try {
      const io = getIO();
      if (io) {
        // Emit to specific table room for customer updates
        io.to(`table_${order.tableNumber}`).emit('orderStatusUpdate', {
          _id: order._id,
          orderNumber: order.orderNumber,
          status: order.status,
          updatedAt: order.updatedAt,
          tableNumber: order.tableNumber
        });

        // Notify kitchen and admin
        io.to('kitchen').to('admin').emit('orderUpdated', {
          orderId: order._id,
          tableNumber: order.tableNumber,
          status: order.status,
          updatedAt: order.updatedAt
        });

        // Special notification when food is ready
        if (order.status === 'ready') {
          console.log('🍽️ Food is ready for Table', order.tableNumber);

          // Emit specific food ready notification to admin
          io.to('admin').emit('foodReady', {
            _id: order._id,
            orderNumber: order.orderNumber,
            tableNumber: order.tableNumber,
            status: order.status,
            updatedAt: order.updatedAt,
            items: order.items
          });

          // Also emit to waiters/staff if needed
          io.to('staff').emit('foodReady', {
            _id: order._id,
            orderNumber: order.orderNumber,
            tableNumber: order.tableNumber,
            status: order.status,
            updatedAt: order.updatedAt
          });
        }
      }
    } catch (socketError) {
      console.error('Socket emission error:', socketError);
    }

    res.json(order);
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get active orders for kitchen
// @route   GET /api/orders/kitchen
// @access  Private/Kitchen
export const getKitchenOrders = async (req, res) => {
  try {
    const orders = await Order.find({ status: { $in: ['pending', 'preparing'] } })
      .sort({ createdAt: 1 });

    res.json(orders);
  } catch (error) {
    console.error('=== GET KITCHEN ORDERS ERROR ===');
    console.error('Error:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);

    res.status(500).json({ message: 'Server error' });
  }
};

export const createOrder = async (req, res) => {
  try {
    console.log('=== CREATE ORDER REQUEST ===');
    console.log('Request body:', JSON.stringify(req.body, null, 2));

    const { tableNumber, items, totalAmount, specialInstructions, customerId } = req.body;

    // Validate required fields
    if (!tableNumber) {
      console.log('ERROR: Missing table number');
      return res.status(400).json({ message: 'Table number is required' });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      console.log('ERROR: Invalid items array');
      return res.status(400).json({ message: 'Order items are required' });
    }

    if (!totalAmount || totalAmount <= 0) {
      console.log('ERROR: Invalid total amount:', totalAmount);
      return res.status(400).json({ message: 'Valid total amount is required' });
    }

    // Create new order
    const order = new Order({
      customerId: customerId || req.user?.id || null,
      tableNumber: parseInt(tableNumber),
      items: items.map(item => ({
        menuItemId: item.menuItemId || null,
        name: item.name || 'Unknown Item',
        quantity: parseInt(item.quantity) || 1,
        price: parseFloat(item.price) || 0
      })),
      totalAmount: parseFloat(totalAmount),
      specialInstructions: specialInstructions || '',
      status: 'pending',
      orderNumber: `ORD-${Date.now()}`
    });

    await order.save();
    console.log('Order saved successfully:', order._id);

    // Emit new order event
    const io = getIO();
    if (io) {
      io.to('kitchen').to('admin').emit('newOrder', {
        ...order.toObject(),
        orderId: order._id,
        tableNumber: order.tableNumber,
        status: order.status,
        createdAt: order.createdAt
      });
      console.log('New order emitted to kitchen and admin');
    }

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order: {
        _id: order._id,
        orderNumber: order.orderNumber,
        tableNumber: order.tableNumber,
        items: order.items,
        totalAmount: order.totalAmount,
        status: order.status,
        createdAt: order.createdAt
      }
    });
  } catch (error) {
    console.error('=== CREATE ORDER ERROR ===');
    console.error('Error:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);

    res.status(500).json({
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Failed to create order',
      details: error.errors ? Object.keys(error.errors) : null
    });
  }
};

export const getOrderById = async (req, res) => {
  try {
    console.log('=== GET ORDER BY ID REQUEST ===');
    console.log('Request params:', JSON.stringify(req.params, null, 2));

    const order = await Order.findById(req.params.id);
    console.log('Order:', JSON.stringify(order, null, 2));

    if (!order) {
      console.log('ERROR: Order not found:', req.params.id);
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json(order);
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getCustomerOrders = async (req, res) => {
  try {
    const orders = await Order.find({ customerId: req.user.id })
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error('Get customer orders error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const confirmOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: 'confirmed' },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Notify kitchen
    const io = getIO();
    io.to('kitchen').emit('orderConfirmed', order);

    res.json(order);
  } catch (error) {
    console.error('Confirm order error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getOrdersByTable = async (req, res) => {
  try {
    const { tableNumber } = req.params;

    if (!tableNumber) {
      return res.status(400).json({ message: 'Table number is required' });
    }

    const orders = await Order.find({ tableNumber })
      .sort({ createdAt: -1 })
      .populate('items.menuItemId', 'name price image');

    res.json(orders);
  } catch (error) {
    console.error('Get orders by table error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getOrdersByCustomerPhone = async (req, res) => {
  try {
    const { phoneNumber } = req.params;

    if (!phoneNumber) {
      return res.status(400).json({ message: 'Phone number is required' });
    }

    console.log('=== GET ORDERS BY PHONE DEBUG ===');
    console.log('Looking for phone:', phoneNumber);

    // Find user by phone number (any role)
    const user = await User.findOne({ phoneNumber });

    if (!user) {
      console.log('No user found with phone:', phoneNumber);
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('Found user:', { name: user.name, email: user.email, role: user.role });

    // If user is not a customer, return empty array (no order history for non-customers)
    if (user.role !== 'customer') {
      console.log('User is not a customer, returning empty orders');
      return res.json([]);
    }

    // Get all orders for this customer
    const orders = await Order.find({ customerId: user._id })
      .sort({ createdAt: -1 })
      .populate('items.menuItemId', 'name price image');

    console.log('Found orders for customer:', orders.length);
    res.json(orders);
  } catch (error) {
    console.error('Get orders by customer phone error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const processPayment = async (req, res) => {
  try {
    const { paymentMethod, amount } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      {
        payment: {
          method: paymentMethod,
          amount,
          status: 'completed',
          paidAt: new Date()
        },
        status: 'completed'
      },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Notify all clients
    const io = getIO();
    io.emit('orderCompleted', order);

    res.json(order);
  } catch (error) {
    console.error('Process payment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getOrdersByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const orders = await Order.find({ status })
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error('Get orders by status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    console.error('Delete order error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
