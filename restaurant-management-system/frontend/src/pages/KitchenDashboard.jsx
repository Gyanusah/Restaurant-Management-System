import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { getOrders, updateOrderStatus } from '../api/api';
import { useAuth } from '../context/AuthContext';
import { io } from 'socket.io-client';

const KitchenDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, preparing, ready
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.role !== 'kitchen') {
      navigate('/');
      return;
    }

    fetchOrders();
    setupSocket();
  }, [user, navigate]);

  const setupSocket = () => {
    const socket = io('http://localhost:5000');
    
    socket.on('connect', () => {
      console.log('Connected to socket server');
      // Join kitchen room
      socket.emit('joinKitchen');
    });
    
    socket.on('newOrder', (order) => {
      console.log('New order received:', order);
      toast.success(`New order from Table ${order.tableNumber}`);
      fetchOrders();
    });

    socket.on('orderStatusUpdate', (order) => {
      console.log('Order updated:', order);
      setOrders(prev => prev.map(o => o._id === order._id ? order : o));
    });

    return () => {
      socket.disconnect();
    };
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await getOrders();
      console.log('Kitchen orders response:', response);
      setOrders(response);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      setOrders(orders.map(order => 
        order._id === orderId ? { ...order, status: newStatus } : order
      ));
      toast.success(`Order status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      preparing: 'bg-blue-100 text-blue-800 border-blue-200',
      ready: 'bg-green-100 text-green-800 border-green-200',
      served: 'bg-gray-100 text-gray-800 border-gray-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: '⏰',
      preparing: '👨‍🍳',
      ready: '✅',
      served: '🍽️',
      cancelled: '❌'
    };
    return icons[status] || '📋';
  };

  const getNextStatus = (currentStatus) => {
    const statusFlow = {
      pending: 'preparing',
      preparing: 'ready',
      ready: 'served',
      served: 'served'
    };
    return statusFlow[currentStatus];
  };

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    return order.status === filter;
  });

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatDuration = (createdAt) => {
    const now = new Date();
    const created = new Date(createdAt);
    const diff = Math.floor((now - created) / 1000 / 60); // minutes
    
    if (diff < 60) return `${diff} min ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)} hours ago`;
    return `${Math.floor(diff / 1440)} days ago`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading kitchen orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-red-600 shadow-xl border-b border-orange-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">Kitchen Dashboard</h1>
                  <p className="text-orange-100 text-sm font-medium">Real-time Order Management</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <span className="text-orange-100 text-sm">Welcome back,</span>
                  <span className="text-white font-semibold">{user?.name}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="px-3 py-1 bg-white/20 text-white text-xs font-bold rounded-full shadow-lg border border-white/30 animate-pulse">
                    KITCHEN
                  </span>
                  <button
                    onClick={logout}
                    className="flex items-center px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-medium rounded-lg transition-all duration-200 shadow-lg border border-white/30"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4 4m4-4H3m6 0l-4 4" />
                    </svg>
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-1">
            {[
              { id: 'all', label: 'All Orders', icon: '📋', count: orders.length },
              { id: 'pending', label: 'Pending', icon: '⏰', count: orders.filter(o => o.status === 'pending').length },
              { id: 'preparing', label: 'Preparing', icon: '👨‍🍳', count: orders.filter(o => o.status === 'preparing').length },
              { id: 'ready', label: 'Ready', icon: '✅', count: orders.filter(o => o.status === 'ready').length }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`relative py-4 px-6 font-medium text-sm transition-all duration-200 group ${
                  filter === tab.id
                    ? 'text-orange-600 border-b-2 border-orange-600 bg-orange-50'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50 border-b-2 border-transparent'
                }`}
              >
                <span className="flex items-center space-x-2">
                  <span className="text-lg">{tab.icon}</span>
                  <span className="font-medium">{tab.label}</span>
                  {tab.count > 0 && (
                    <span className="ml-2 px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full animate-pulse">
                      {tab.count}
                    </span>
                  )}
                </span>
                {filter === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-600"></div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-4">
              <div className="flex items-center justify-between">
                <div className="text-white">
                  <div className="text-2xl font-bold">{orders.filter(o => o.status === 'pending').length}</div>
                  <div className="text-sm opacity-90">Pending Orders</div>
                </div>
                <div className="text-white text-3xl">⏰</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4">
              <div className="flex items-center justify-between">
                <div className="text-white">
                  <div className="text-2xl font-bold">{orders.filter(o => o.status === 'preparing').length}</div>
                  <div className="text-sm opacity-90">Preparing</div>
                </div>
                <div className="text-white text-3xl">👨‍🍳</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-green-500 to-green-600 p-4">
              <div className="flex items-center justify-between">
                <div className="text-white">
                  <div className="text-2xl font-bold">{orders.filter(o => o.status === 'ready').length}</div>
                  <div className="text-sm opacity-90">Ready to Serve</div>
                </div>
                <div className="text-white text-3xl">✅</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-4">
              <div className="flex items-center justify-between">
                <div className="text-white">
                  <div className="text-2xl font-bold">{orders.filter(o => o.status === 'served').length}</div>
                  <div className="text-sm opacity-90">Served Today</div>
                </div>
                <div className="text-white text-3xl">🍽️</div>
              </div>
            </div>
          </div>
        </div>

        {/* Orders Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredOrders.length === 0 ? (
            <div className="col-span-full">
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-12 text-center">
                <div className="text-gray-400 mb-4">
                  <svg className="w-24 h-24 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Orders Found</h3>
                <p className="text-gray-600">
                  {filter === 'all' 
                    ? 'No orders available yet. Orders will appear here when customers place them.' 
                    : `No ${filter} orders at the moment.`
                  }
                </p>
              </div>
            </div>
          ) : (
            filteredOrders.map((order) => (
              <div key={order._id} className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow duration-300">
                {/* Order Header */}
                <div className={`border-b-2 ${getStatusColor(order.status)}`}>
                  <div className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center space-x-3 mb-2">
                          <span className="text-2xl font-bold text-gray-900">Table {order.tableNumber}</span>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                            {getStatusIcon(order.status)} {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">
                          Order #{order.orderNumber || order._id.slice(-8)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-500">
                          {formatTime(order.createdAt)}
                        </div>
                        <div className="text-xs text-gray-400">
                          {formatDuration(order.createdAt)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="p-4">
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-900 mb-3">Order Items</h4>
                    <div className="space-y-2">
                      {order.items?.map((item, index) => (
                        <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">{item.name}</div>
                            <div className="text-sm text-gray-600">Qty: {item.quantity}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-gray-900">${(item.price * item.quantity).toFixed(2)}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Total */}
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-gray-900">Total</span>
                      <span className="text-xl font-bold text-green-600">${order.totalAmount?.toFixed(2) || '0.00'}</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
                  <div className="flex space-x-2">
                    {order.status !== 'served' && order.status !== 'cancelled' && (
                      <button
                        onClick={() => updateOrderStatus(order._id, getNextStatus(order.status))}
                        className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold py-2 px-4 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 flex items-center justify-center"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        {getNextStatus(order.status) === 'preparing' ? 'Start Preparing' : 
                         getNextStatus(order.status) === 'ready' ? 'Mark Ready' : 
                         getNextStatus(order.status) === 'served' ? 'Mark Served' : 'Update Status'}
                      </button>
                    )}
                    {order.status === 'cancelled' && (
                      <div className="flex-1 text-center text-red-600 font-semibold">
                        Order Cancelled
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default KitchenDashboard;
