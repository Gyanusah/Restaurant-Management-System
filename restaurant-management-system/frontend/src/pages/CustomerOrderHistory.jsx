import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { getOrdersByTable, getCustomerOrders, getCustomerOrdersByPhone } from '../api/api';
import { io } from 'socket.io-client';

const CustomerOrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tableNumber, setTableNumber] = useState('');
  const [customerInfo, setCustomerInfo] = useState(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('=== CUSTOMER ORDER HISTORY USEEFFECT ===');
    
    // Get customer info from localStorage (if logged in)
    const storedCustomerInfo = localStorage.getItem('customerInfo');
    console.log('Raw customer info from localStorage:', storedCustomerInfo);
    
    if (storedCustomerInfo) {
      const parsedCustomerInfo = JSON.parse(storedCustomerInfo);
      console.log('Parsed customer info:', parsedCustomerInfo);
      setCustomerInfo(parsedCustomerInfo);
    } else {
      console.log('No customer info found in localStorage');
    }

    // Get table number from URL or localStorage
    const tableFromUrl = searchParams.get('table') || localStorage.getItem('currentTable');
    console.log('Table from URL:', searchParams.get('table'));
    console.log('Table from localStorage:', localStorage.getItem('currentTable'));
    console.log('Final table number:', tableFromUrl);
    
    if (!tableFromUrl) {
      toast.error('No table selected. Redirecting to table selection...');
      navigate('/scan');
      return;
    }
    
    setTableNumber(tableFromUrl);
    fetchOrders(tableFromUrl, storedCustomerInfo ? JSON.parse(storedCustomerInfo) : null);
    setupSocket(tableFromUrl);
  }, [searchParams, navigate]);

  const setupSocket = (tableNum) => {
    const socketUrl = import.meta.env.VITE_API_BASE_URL 
      ? import.meta.env.VITE_API_BASE_URL 
      : 'http://localhost:5000';
    
    console.log('🔌 Connecting to socket at:', socketUrl);
    const socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      timeout: 10000,
      forceNew: true
    });
    
    socket.on('connect', () => {
      console.log('Customer connected to socket server');
      // Join table room for real-time updates
      socket.emit('joinTable', tableNum);
    });
    
    socket.on('orderStatusUpdate', (order) => {
      console.log('Customer - Order status updated:', order);
      setOrders(prev => prev.map(o => o._id === order._id ? order : o));
      toast.info(`Order #${order.orderNumber || order._id.slice(-8)} status: ${order.status}`);
    });

    return () => {
      socket.disconnect();
    };
  };

  const fetchOrders = async (tableNum, customerInfo) => {
    try {
      setLoading(true);
      
      console.log('=== FETCHING ORDERS DEBUG ===');
      console.log('Table number:', tableNum);
      console.log('Customer info:', customerInfo);
      
      let response;
      if (customerInfo && customerInfo.phoneNumber) {
        // If logged in, get all customer orders by phone number
        console.log('Fetching orders by phone:', customerInfo.phoneNumber);
        response = await getCustomerOrdersByPhone(customerInfo.phoneNumber);
        console.log('Customer orders by phone response:', response);
        console.log('Response type:', typeof response);
        console.log('Is array:', Array.isArray(response));
        console.log('Response length:', response.length);
      } else if (customerInfo && customerInfo.customerId) {
        // Fallback: try customer orders with auth (shouldn't reach here but just in case)
        console.log('Fetching orders by customer ID:', customerInfo.customerId);
        response = await getCustomerOrders();
        console.log('Customer orders auth response:', response);
      } else {
        // If guest, show NO orders - guests cannot see history
        console.log('Guest user - no order history shown');
        response = [];
      }
      
      console.log('Final orders to set:', response);
      setOrders(response);
    } catch (error) {
      console.error('Error fetching orders:', error);
      console.error('Error response:', error.response);
      toast.error('Failed to fetch order history');
    } finally {
      setLoading(false);
    }
  };

  const handleReviewOrder = (orderId) => {
    navigate(`/review/${orderId}`);
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      preparing: 'bg-blue-100 text-blue-800 border-blue-200',
      ready: 'bg-green-100 text-green-800 border-green-200',
      served: 'bg-gray-100 text-gray-800 border-gray-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200',
      completed: 'bg-purple-100 text-purple-800 border-purple-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: '⏰',
      preparing: '👨‍🍳',
      ready: '✅',
      served: '🍽️',
      cancelled: '❌',
      completed: '✨'
    };
    return icons[status] || '📋';
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric',
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

  const getStatusText = (status) => {
    const statusTexts = {
      pending: 'Order Received - Waiting for kitchen',
      preparing: 'Being Prepared - Kitchen is working on your order',
      ready: 'Ready for Pickup - Your food is ready!',
      served: 'Served - Enjoy your meal!',
      cancelled: 'Cancelled - Order was cancelled',
      completed: 'Completed - Order finished'
    };
    return statusTexts[status] || 'Unknown status';
  };

  const handleLogin = () => {
    navigate(`/customer-login?table=${tableNumber}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your order history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-teal-700 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">My Orders</h1>
                  <h1 className="text-3xl font-bold text-white mb-2">
                    {customerInfo ? `${customerInfo.name} - All Your Orders` : 'Order History'}
                  </h1>
                  <p className="text-white/90">
                    {customerInfo ? 
                      'View your complete order history across all visits' :
                      'Please sign in to view your order history'
                    }
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                {!customerInfo && (
                  <button
                    onClick={handleLogin}
                    className="flex items-center px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-medium rounded-lg transition-all duration-200 shadow-lg border border-white/30"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    Sign In
                  </button>
                )}
                <button
                  onClick={() => navigate(`/menu?table=${tableNumber}`)}
                  className="flex items-center px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-medium rounded-lg transition-all duration-200 shadow-lg border border-white/30"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </svg>
                  Order More
                </button>
                <button
                  onClick={() => navigate('/scan')}
                  className="flex items-center px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-medium rounded-lg transition-all duration-200 shadow-lg border border-white/30"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  Change Table
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Guest Notice */}
      {!customerInfo && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                <strong>Guest Session:</strong> You're viewing orders for Table {tableNumber} only. 
                <button onClick={handleLogin} className="font-medium underline ml-1">Sign in</button> to see your complete order history across all visits.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {orders.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-12 text-center">
            <div className="text-gray-400 mb-4">
              <svg className="w-24 h-24 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {customerInfo ? 'No Orders Yet' : 'Sign In to View Orders'}
            </h3>
            <p className="text-gray-600 mb-6">
              {customerInfo ? 
                "You haven't placed any orders yet." :
                "Please sign in to view your order history. Guest users cannot access order history for security reasons."
              }
            </p>
            <div className="flex gap-3 justify-center">
              {customerInfo ? (
                <button
                  onClick={() => navigate(`/menu?table=${tableNumber}`)}
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-600 to-teal-700 text-white font-medium rounded-lg hover:from-green-700 hover:to-teal-800 transition-all duration-200 shadow-lg"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </svg>
                  Place Your First Order
                </button>
              ) : (
                <>
                  <button
                    onClick={() => navigate(`/customer-login?table=${tableNumber}`)}
                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-medium rounded-lg hover:from-blue-700 hover:to-indigo-800 transition-all duration-200 shadow-lg"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Sign In to View Orders
                  </button>
                  <button
                    onClick={() => navigate(`/menu?table=${tableNumber}`)}
                    className="inline-flex items-center px-6 py-3 bg-white text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors border border-gray-300"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                    </svg>
                    Order as Guest
                  </button>
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order._id} className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow duration-300">
                {/* Order Header */}
                <div className={`border-b-2 ${getStatusColor(order.status)}`}>
                  <div className="p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center space-x-3 mb-2">
                          <span className="text-2xl font-bold text-gray-900">Order #{order.orderNumber || order._id.slice(-8)}</span>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                            {getStatusIcon(order.status)} {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">
                          {customerInfo ? 'All Tables' : `Table ${order.tableNumber}`} • {formatTime(order.createdAt)}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {formatDuration(order.createdAt)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-600">${order.totalAmount?.toFixed(2) || '0.00'}</div>
                      </div>
                    </div>
                    
                    {/* Status Description */}
                    <div className="mt-4 p-3 bg-white/50 rounded-lg">
                      <p className="text-sm font-medium text-gray-700">{getStatusText(order.status)}</p>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="p-6">
                  <h4 className="font-semibold text-gray-900 mb-4">Order Items</h4>
                  <div className="space-y-3">
                    {order.items?.map((item, index) => (
                      <div key={index} className="flex justify-between items-center py-3 border-b border-gray-100 last:border-0">
                        <div className="flex items-center space-x-4">
                          <div className="text-2xl">
                            {item.image ? (
                              <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover" />
                            ) : (
                              '🍽️'
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{item.name}</div>
                            <div className="text-sm text-gray-600">Quantity: {item.quantity}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-gray-900">${(item.price * item.quantity).toFixed(2)}</div>
                          <div className="text-sm text-gray-600">${item.price.toFixed(2)} each</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Order Summary */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-gray-900">Total Amount</span>
                      <span className="text-xl font-bold text-green-600">${order.totalAmount?.toFixed(2) || '0.00'}</span>
                    </div>
                    
                    {/* Review Button for Completed Orders */}
                    {customerInfo && order.status === 'completed' && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <button
                          onClick={() => handleReviewOrder(order._id)}
                          className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-medium py-3 px-4 rounded-lg hover:from-blue-700 hover:to-indigo-800 transition-all duration-200 shadow-lg flex items-center justify-center"
                        >
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462a1 1 0 00.951-.69l1.07-3.292a1 1 0 001.603-.921 1.902 0l-3.432 4.561a1 1 0 00-1.902 0l-3.432-4.561a1 1 0 00-1.603.921 1.902 0L9.049 2.927zM12 15a1 1 0 100 2 0 1 1 0 000-2z" />
                          </svg>
                          Rate Your Experience
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Place Another Order Section */}
        {orders.length > 0 && (
          <div className="mt-8 bg-gradient-to-r from-green-50 to-teal-50 rounded-xl p-6 border border-green-200">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Ready for More?</h3>
              <p className="text-gray-600 mb-4">
                Place another order from {customerInfo ? 'your account' : 'your table'}
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => navigate(`/menu?table=${tableNumber}`)}
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-600 to-teal-700 text-white font-medium rounded-lg hover:from-green-700 hover:to-teal-800 transition-all duration-200 shadow-lg"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </svg>
                  Place Another Order
                </button>
                <button
                  onClick={() => navigate(`/my-orders?table=${tableNumber}`)}
                  className="inline-flex items-center px-6 py-3 bg-white text-green-600 font-medium rounded-lg hover:bg-gray-50 transition-colors border border-green-300"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Refresh Orders
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerOrderHistory;
