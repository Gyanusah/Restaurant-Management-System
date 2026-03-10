import express from 'express';
import {
    createOrder,
    getAllOrders,
    getOrderById,
    getCustomerOrders,
    getOrdersByTable,
    updateOrderStatus,
    deleteOrder,
    confirmOrder,
    processPayment,
    getOrdersByStatus,
    getKitchenOrders,
    getOrdersByCustomerPhone,
} from '../controllers/orderController.js';
import { verifyToken, authorizeRole } from '../middleware/auth.js';

const router = express.Router();

// Simple test route at the very beginning
router.get('/debug', (req, res) => {
    console.log('=== ORDER ROUTES DEBUG HIT ===');
    res.json({
        message: 'Order routes working',
        timestamp: new Date().toISOString(),
        path: req.path
    });
});

// Test route
router.get('/test', (req, res) => {
    res.json({ message: 'Order routes working' });
});

// @route   GET /api/orders/kitchen
// @desc    Get active orders for kitchen (pending, preparing)
// @access  Private/Kitchen
router.get('/kitchen', verifyToken, authorizeRole(['kitchen', 'admin']), getKitchenOrders);

// @route   GET /api/orders/customer/orders
// @desc    Get orders for authenticated customer
// @access  Private/Customer
router.get('/customer/orders', verifyToken, authorizeRole(['customer']), getCustomerOrders);

// @route   GET /api/orders/customer/by-phone/:phoneNumber
// @desc    Get orders by customer phone number (no auth required)
// @access  Public
router.get('/customer/by-phone/:phoneNumber', (req, res) => {
    console.log('=== BY-PHONE ROUTE HIT ===');
    console.log('Request params:', req.params);
    console.log('Phone number:', req.params.phoneNumber);

    // Call the actual controller function
    getOrdersByCustomerPhone(req, res);
});

// @route   GET /api/orders/table/:tableNumber
// @desc    Get orders by table number (for customers)
// @access  Public
router.get('/table/:tableNumber', getOrdersByTable);

// @route   POST /api/orders
// @desc    Create new order (no auth required for QR scanning)
// @access  Public
router.post('/', createOrder);

router.post('/:id/confirm', verifyToken, confirmOrder);
router.post('/:id/payment', verifyToken, processPayment);
router.get('/', verifyToken, authorizeRole(['admin', 'kitchen']), getAllOrders);
router.get('/status/:status', verifyToken, authorizeRole(['admin', 'kitchen']), getOrdersByStatus);

router.get('/:id', verifyToken, getOrderById);
router.put('/:id/status', verifyToken, authorizeRole(['kitchen', 'admin']), updateOrderStatus);
router.delete('/:id', verifyToken, authorizeRole(['admin']), deleteOrder);

export default router;
