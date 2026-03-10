import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { getOrders, updateOrderStatus } from '../api/api';
import { useAuth } from '../context/AuthContext';
import { io } from 'socket.io-client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import MenuItemsManagement from './MenuItemsManagement';
import CategoriesManagement from './CategoriesManagement';
import TablesManagement from './TablesManagement';
import UsersManagement from './UsersManagement';
import ReviewsManagement from './ReviewsManagement';
import QRCodeGenerator from './QRCodeGenerator';
import RawMaterialsManagement from './RawMaterialsManagement';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [orders, setOrders] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateFilter, setDateFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filteredOrders, setFilteredOrders] = useState([]);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'analytics', label: 'Analytics', icon: '📈' },
    { id: 'reports', label: 'Reports', icon: '📑' },
    { id: 'menu-items', label: 'Menu Items', icon: '🍽️' },
    { id: 'categories', label: 'Categories', icon: '🏷️' },
    { id: 'tables', label: 'Tables', icon: '🪑' },
    { id: 'users', label: 'Users', icon: '👥' },
    { id: 'reviews', label: 'Reviews', icon: '⭐' },
    { id: 'qrcodes', label: 'QR Codes', icon: '📱' },
    { id: 'raw-materials', label: 'Raw Materials', icon: '📦' }
  ];

  // Calculate statistics
  const stats = {
    totalOrders: orders.length,
    totalSales: orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0),
    activeTables: [...new Set(orders.filter(order => order.status === 'pending' || order.status === 'preparing').map(order => order.tableNumber))].length,
    totalUsers: 7 // From seed data
  };

  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/');
      return;
    }

    fetchOrders();
    setupSocket();
  }, [user, navigate]);

  const setupSocket = () => {
    const socket = io('http://localhost:5000');
    
    socket.on('connect', () => {
      console.log('Admin connected to socket server');
      // Join admin room for real-time updates
      socket.emit('joinAdmin');
    });
    
    socket.on('newOrder', (order) => {
      console.log('Admin - New order received:', order);
      toast.success(`New order from Table ${order.tableNumber} - $${order.totalAmount?.toFixed(2)}`);
      fetchOrders();
    });

    socket.on('orderStatusUpdate', (order) => {
      console.log('Admin - Order status updated:', order);
      setOrders(prev => prev.map(o => o._id === order._id ? order : o));
      
      // Show special notification when food is ready
      if (order.status === 'ready') {
        const notification = {
          id: Date.now(),
          type: 'food_ready',
          message: `🍽️ Food is ready for Table ${order.tableNumber}! Order #${order.orderNumber || order._id.slice(-8)}`,
          order: order,
          timestamp: new Date(),
          read: false
        };
        
        setNotifications(prev => [notification, ...prev]);
        toast.success(`🍽️ Food ready for Table ${order.tableNumber}!`, {
          duration: 5000,
          icon: '🍽️'
        });
        
        // Play notification sound (optional)
        const audio = new Audio('/notification-sound.mp3');
        audio.play().catch(e => console.log('Audio play failed:', e));
      } else {
        toast.info(`Order #${order.orderNumber || order._id.slice(-8)} status: ${order.status}`);
      }
    });

    socket.on('foodReady', (order) => {
      console.log('Admin - Food ready notification:', order);
      const notification = {
        id: Date.now(),
        type: 'food_ready',
        message: `🍽️ Food is ready for Table ${order.tableNumber}! Order #${order.orderNumber || order._id.slice(-8)}`,
        order: order,
        timestamp: new Date(),
        read: false
      };
      
      setNotifications(prev => [notification, ...prev]);
      toast.success(`🍽️ Food ready for Table ${order.tableNumber}!`, {
        duration: 5000,
        icon: '🍽️'
      });
    });

    return () => {
      socket.disconnect();
    };
  };

  const markNotificationAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
  };

  const clearNotification = (notificationId) => {
    setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  // Filter orders based on date range
  useEffect(() => {
    if (orders.length === 0) return;

    let filtered = [...orders];
    const now = new Date();

    switch (dateFilter) {
      case 'today':
        filtered = orders.filter(order => {
          const orderDate = new Date(order.createdAt);
          return orderDate.toDateString() === now.toDateString();
        });
        break;
      
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        filtered = orders.filter(order => new Date(order.createdAt) >= weekAgo);
        break;
      
      case 'month':
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        filtered = orders.filter(order => new Date(order.createdAt) >= monthAgo);
        break;
      
      case 'year':
        const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        filtered = orders.filter(order => new Date(order.createdAt) >= yearAgo);
        break;
      
      case 'custom':
        if (startDate && endDate) {
          filtered = orders.filter(order => {
            const orderDate = new Date(order.createdAt);
            return orderDate >= new Date(startDate) && orderDate <= new Date(endDate);
          });
        }
        break;
      
      default:
        filtered = orders;
    }

    setFilteredOrders(filtered);
  }, [orders, dateFilter, startDate, endDate]);

  // Download invoice function
  const downloadInvoice = () => {
    const ordersToDownload = filteredOrders.length > 0 ? filteredOrders : orders;
    
    if (ordersToDownload.length === 0) {
      toast.error('No orders to download');
      return;
    }

    // Create CSV content
    const headers = ['Order ID', 'Table', 'Items', 'Total', 'Status', 'Date', 'Customer'];
    const csvContent = [
      headers.join(','),
      ...ordersToDownload.map(order => [
        order.orderNumber || order._id.slice(-8),
        order.tableNumber,
        order.items?.length || 0,
        order.totalAmount?.toFixed(2) || '0.00',
        order.status,
        new Date(order.createdAt).toLocaleDateString(),
        order.customerId ? 'Registered' : 'Guest'
      ].join(','))
    ].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders_${dateFilter}_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    toast.success('Invoice downloaded successfully');
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getOrders();
      console.log('Orders response:', response);
      setOrders(response);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('Failed to fetch orders. Please try again.');
      toast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      setOrders(orders.map(order => 
        order._id === orderId ? { ...order, status: newStatus } : order
      ));
      toast.success('Order status updated successfully');
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      preparing: 'bg-blue-100 text-blue-800',
      ready: 'bg-green-100 text-green-800',
      completed: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusBadge = (status) => {
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(status)}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  // Sales data for charts
  const salesByDay = orders.reduce((acc, order) => {
    const date = new Date(order.createdAt).toLocaleDateString();
    acc[date] = (acc[date] || 0) + (order.totalAmount || 0);
    return acc;
  }, {});

  const salesData = Object.entries(salesByDay).map(([date, sales]) => ({
    date,
    sales
  })).slice(-7); // Last 7 days

  const orderStatusData = [
    { name: 'Pending', value: orders.filter(o => o.status === 'pending').length, color: '#fbbf24' },
    { name: 'Preparing', value: orders.filter(o => o.status === 'preparing').length, color: '#60a5fa' },
    { name: 'Ready', value: orders.filter(o => o.status === 'ready').length, color: '#34d399' },
    { name: 'Completed', value: orders.filter(o => o.status === 'completed').length, color: '#9ca3af' }
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-700 shadow-xl border-b border-indigo-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
                  <p className="text-indigo-100 text-sm font-medium">Restaurant Management System</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <span className="text-indigo-100 text-sm">Welcome back,</span>
                  <span className="text-white font-semibold">{user?.name}</span>
                </div>
                <div className="flex items-center space-x-3">
                  {/* Notification Icon */}
                  <div className="relative">
                    <button
                      className="relative p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all duration-200 shadow-lg border border-white/30"
                      onClick={() => setShowNotifications(!showNotifications)}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                      </svg>
                      {notifications.filter(n => !n.read).length > 0 && (
                        <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
                      )}
                    </button>

                    {/* Notification Dropdown */}
                    {showNotifications && (
                      <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                        <div className="p-4 border-b border-gray-200">
                          <div className="flex justify-between items-center">
                            <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                            {notifications.length > 0 && (
                              <button
                                onClick={clearAllNotifications}
                                className="text-sm text-red-600 hover:text-red-800"
                              >
                                Clear All
                              </button>
                            )}
                          </div>
                        </div>
                        <div className="max-h-96 overflow-y-auto">
                          {notifications.length === 0 ? (
                            <div className="p-4 text-center text-gray-500">
                              <svg className="w-12 h-12 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                              </svg>
                              <p>No notifications</p>
                            </div>
                          ) : (
                            notifications.map((notification) => (
                              <div
                                key={notification.id}
                                className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                                  !notification.read ? 'bg-blue-50' : ''
                                }`}
                                onClick={() => markNotificationAsRead(notification.id)}
                              >
                                <div className="flex items-start space-x-3">
                                  <div className="flex-shrink-0">
                                    {notification.type === 'food_ready' ? (
                                      <span className="text-2xl">🍽️</span>
                                    ) : (
                                      <span className="text-2xl">📢</span>
                                    )}
                                  </div>
                                  <div className="flex-1">
                                    <p className={`text-sm ${!notification.read ? 'font-semibold text-gray-900' : 'text-gray-600'}`}>
                                      {notification.message}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                      {new Date(notification.timestamp).toLocaleTimeString()}
                                    </p>
                                  </div>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      clearNotification(notification.id);
                                    }}
                                    className="text-gray-400 hover:text-red-600"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                  </button>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <span className="px-3 py-1 bg-white/20 text-white text-xs font-bold rounded-full shadow-lg border border-white/30">
                    ADMIN
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

      <div className="flex h-screen bg-gray-100">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-lg">
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Admin Panel</h2>
            <nav className="space-y-2">
              {navigationItems.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full text-left px-4 py-3 rounded-lg font-medium text-sm transition-all duration-200 flex items-center space-x-3 ${
                    activeTab === tab.id
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <span className="text-lg">{tab.icon}</span>
                  <span>{tab.label}</span>
                  {tab.id === 'orders' && orders.length > 0 && (
                    <span className="ml-auto px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
                      {orders.length}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-xl border border-indigo-200 overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="text-white">
                      <div className="text-3xl font-bold mb-1">{stats.totalOrders}</div>
                      <div className="text-indigo-100 font-medium">Total Orders</div>
                    </div>
                    <div className="text-white text-4xl opacity-80">📊</div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-xl border border-green-200 overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="text-white">
                      <div className="text-3xl font-bold mb-1">${stats.totalSales}</div>
                      <div className="text-green-100 font-medium">Total Sales</div>
                    </div>
                    <div className="text-white text-4xl opacity-80">💰</div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl shadow-xl border border-blue-200 overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="text-white">
                      <div className="text-3xl font-bold mb-1">{stats.activeTables}</div>
                      <div className="text-blue-100 font-medium">Active Tables</div>
                    </div>
                    <div className="text-white text-4xl opacity-80">🪑</div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-xl border border-purple-200 overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="text-white">
                      <div className="text-3xl font-bold mb-1">{stats.totalUsers}</div>
                      <div className="text-purple-100 font-medium">Total Users</div>
                    </div>
                    <div className="text-white text-4xl opacity-80">👥</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Sales Chart */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Sales Overview (Last 7 Days)</h3>
                <div className="h-64">
                  {salesData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={salesData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="date" 
                          tick={{ fontSize: 12 }}
                          angle={-45}
                          textAnchor="end"
                          height={60}
                        />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip 
                          formatter={(value) => [`$${value.toFixed(2)}`, 'Sales']}
                          contentStyle={{ 
                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                            border: '1px solid #ccc',
                            borderRadius: '4px'
                          }}
                        />
                        <Legend />
                        <Bar 
                          dataKey="sales" 
                          fill="#8b5cf6"
                          radius={[8, 8, 0, 0]}
                          name="Sales ($)"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-500">
                      <div className="text-center">
                        <svg className="w-16 h-16 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0h6" />
                        </svg>
                        <p className="text-sm">No sales data available</p>
                        <p className="text-xs text-gray-400">Orders will appear here once customers start ordering</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Order Status Distribution */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Order Status Distribution</h3>
                <div className="h-64">
                  {orderStatusData.some(item => item.value > 0) ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={orderStatusData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {orderStatusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value, name) => [value, name]}
                          contentStyle={{ 
                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                            border: '1px solid #ccc',
                            borderRadius: '4px'
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-500">
                      <div className="text-center">
                        <svg className="w-16 h-16 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        <p className="text-sm">No order data available</p>
                        <p className="text-xs text-gray-400">Orders will appear here once customers start ordering</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">All Orders</h2>
              <button
                onClick={fetchOrders}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh Orders
              </button>
            </div>
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Table</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {orders.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">
                          No orders found
                        </td>
                      </tr>
                    ) : orders.map((order) => (
                      <tr key={order._id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {order.orderNumber || order._id.slice(-8)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {order.tableNumber}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {order.items?.length || 0} items
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ${order.totalAmount?.toFixed(2) || '0.00'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(order.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <select
                            value={order.status}
                            onChange={(e) => handleUpdateOrderStatus(order._id, e.target.value)}
                            className="text-sm border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                          >
                            <option value="pending">Pending</option>
                            <option value="preparing">Preparing</option>
                            <option value="ready">Ready</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Menu Tab */}
        {activeTab === 'menu' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Menu Management</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Menu Items Management */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow duration-300">
                <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-6">
                  <div className="flex items-center">
                    <div className="bg-white/20 rounded-lg p-3">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5c-1.83 0-3.046.625-3.046 1.697v13c0 1.072.625 2.216 1.697 3.046 3.046.625 2.216 1.697v13z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-xl font-bold text-white">Menu Items</h3>
                      <p className="text-purple-100 text-sm">Full CRUD operations</p>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-gray-600 mb-4">Add, edit, delete menu items with images, prices, and categories.</p>
                  <button 
                    onClick={() => navigate('/admin/menu-items')}
                    className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white font-semibold py-3 px-6 rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-200 flex items-center justify-center group"
                  >
                    <svg className="w-5 h-5 mr-2 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-2H4m16 0l-8 2" />
                    </svg>
                    Manage Menu Items
                  </button>
                </div>
              </div>

              {/* Categories Management */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow duration-300">
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6">
                  <div className="flex items-center">
                    <div className="bg-white/20 rounded-lg p-3">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h10M7 12h10m-7 5h10M5 7v10" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-xl font-bold text-white">Categories</h3>
                      <p className="text-blue-100 text-sm">Organize menu sections</p>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-gray-600 mb-4">Create and manage food categories for better organization.</p>
                  <button 
                    onClick={() => navigate('/admin/categories')}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold py-3 px-6 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 flex items-center justify-center group"
                  >
                    <svg className="w-5 h-5 mr-2 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-2H4m16 0l-8 2" />
                    </svg>
                    Manage Categories
                  </button>
                </div>
              </div>

              {/* Tables Management */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow duration-300">
                <div className="bg-gradient-to-r from-green-600 to-green-700 p-6">
                  <div className="flex items-center">
                    <div className="bg-white/20 rounded-lg p-3">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-xl font-bold text-white">Tables</h3>
                      <p className="text-green-100 text-sm">Restaurant layout</p>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-gray-600 mb-4">Manage table numbers, seating capacity, and QR code assignments.</p>
                  <button 
                    onClick={() => navigate('/admin/tables')}
                    className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold py-3 px-6 rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 flex items-center justify-center group"
                  >
                    <svg className="w-5 h-5 mr-2 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-2H4m16 0l-8 2" />
                    </svg>
                    Manage Tables
                  </button>
                </div>
              </div>

              {/* Users Management */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow duration-300">
                <div className="bg-gradient-to-r from-orange-600 to-orange-700 p-6">
                  <div className="flex items-center">
                    <div className="bg-white/20 rounded-lg p-3">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-xl font-bold text-white">Users</h3>
                      <p className="text-orange-100 text-sm">Staff accounts</p>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-gray-600 mb-4">Add, edit, and manage staff accounts with different roles and permissions.</p>
                  <button 
                    onClick={() => navigate('/admin/users')}
                    className="w-full bg-gradient-to-r from-orange-600 to-orange-700 text-white font-semibold py-3 px-6 rounded-lg hover:from-orange-700 hover:to-orange-800 transition-all duration-200 flex items-center justify-center group"
                  >
                    <svg className="w-5 h-5 mr-2 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    Manage Users
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="mt-8 bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Statistics</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{stats.totalOrders}</div>
                  <div className="text-sm text-gray-600">Total Orders</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">${stats.totalSales.toFixed(2)}</div>
                  <div className="text-sm text-gray-600">Total Revenue</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{stats.activeTables}</div>
                  <div className="text-sm text-gray-600">Active Tables</div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">{stats.totalUsers}</div>
                  <div className="text-sm text-gray-600">Staff Members</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Sales Analytics</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Revenue Analytics</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <span className="text-sm text-gray-600">Average Order Value</span>
                    <span className="text-lg font-semibold">
                      ${stats.totalOrders > 0 ? (stats.totalSales / stats.totalOrders).toFixed(2) : '0.00'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <span className="text-sm text-gray-600">Orders per Day</span>
                    <span className="text-lg font-semibold">
                      {(stats.totalOrders / 7).toFixed(1)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <span className="text-sm text-gray-600">Peak Sales Day</span>
                    <span className="text-lg font-semibold">
                      {salesData.length > 0 ? salesData.reduce((max, day) => day.sales > max.sales ? day : max, salesData[0]).date : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Order Analytics</h3>
                <div className="space-y-3">
                  {orderStatusData.map((item) => (
                    <div key={item.name} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <div className="flex items-center">
                        <div className={`w-4 h-4 rounded-full mr-3`} style={{ backgroundColor: item.color }}></div>
                        <span className="text-sm text-gray-700">{item.name} Orders</span>
                      </div>
                      <span className="text-lg font-semibold">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Order Reports & Analytics</h2>
              <button
                onClick={downloadInvoice}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download Invoice
              </button>
            </div>

            {/* Date Filter Controls */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Filter Orders</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Quick Filter</label>
                  <select
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Time</option>
                    <option value="today">Today</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                    <option value="year">This Year</option>
                    <option value="custom">Custom Range</option>
                  </select>
                </div>

                {dateFilter === 'custom' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Report Statistics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Summary Statistics</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <span className="text-sm text-gray-600">Total Orders</span>
                    <span className="text-xl font-bold text-blue-600">
                      {filteredOrders.length > 0 ? filteredOrders.length : orders.length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <span className="text-sm text-gray-600">Total Revenue</span>
                    <span className="text-xl font-bold text-green-600">
                      ${(filteredOrders.length > 0 ? filteredOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0) : stats.totalSales).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                    <span className="text-sm text-gray-600">Average Order Value</span>
                    <span className="text-xl font-bold text-purple-600">
                      ${((filteredOrders.length > 0 ? filteredOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0) : stats.totalSales) / (filteredOrders.length > 0 ? filteredOrders.length : stats.totalOrders)).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                    <span className="text-sm text-gray-600">Unique Tables</span>
                    <span className="text-xl font-bold text-orange-600">
                      {[...new Set((filteredOrders.length > 0 ? filteredOrders : orders).map(order => order.tableNumber))].length}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Analysis</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-indigo-50 rounded-lg">
                    <span className="text-sm text-gray-600">Guest Orders</span>
                    <span className="text-xl font-bold text-indigo-600">
                      {(filteredOrders.length > 0 ? filteredOrders : orders).filter(order => !order.customerId).length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-teal-50 rounded-lg">
                    <span className="text-sm text-gray-600">Registered Customer Orders</span>
                    <span className="text-xl font-bold text-teal-600">
                      {(filteredOrders.length > 0 ? filteredOrders : orders).filter(order => order.customerId).length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-pink-50 rounded-lg">
                    <span className="text-sm text-gray-600">Customer Retention Rate</span>
                    <span className="text-xl font-bold text-pink-600">
                      {(() => {
                        const totalOrders = filteredOrders.length > 0 ? filteredOrders : orders;
                        const customerOrders = totalOrders.filter(order => order.customerId);
                        return customerOrders.length > 0 ? 
                          ((customerOrders.length / totalOrders.length) * 100).toFixed(1) + '%' : '0%';
                      })()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  Order History {dateFilter !== 'all' && `- ${dateFilter.charAt(0).toUpperCase() + dateFilter.slice(1)}`}
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Table</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {(filteredOrders.length > 0 ? filteredOrders : orders).length === 0 ? (
                      <tr>
                        <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">
                          No orders found for the selected period
                        </td>
                      </tr>
                    ) : (
                      (filteredOrders.length > 0 ? filteredOrders : orders).map((order) => (
                        <tr key={order._id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {order.orderNumber || order._id.slice(-8)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {order.tableNumber}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {order.items?.length || 0} items
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            ${order.totalAmount?.toFixed(2) || '0.00'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              order.status === 'completed' ? 'bg-green-100 text-green-800' :
                              order.status === 'ready' ? 'bg-blue-100 text-blue-800' :
                              order.status === 'preparing' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              order.customerId ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {order.customerId ? 'Registered' : 'Guest'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Reviews Tab */}
        {activeTab === 'reviews' && <ReviewsManagement />}

        {/* QR Codes Tab */}
        {activeTab === 'qrcodes' && <QRCodeGenerator />}

        {/* Raw Materials Tab */}
        {activeTab === 'raw-materials' && <RawMaterialsManagement />}

        {/* Menu Items Tab */}
        {activeTab === 'menu-items' && <MenuItemsManagement />}

        {/* Categories Tab */}
        {activeTab === 'categories' && <CategoriesManagement />}

        {/* Tables Tab */}
        {activeTab === 'tables' && <TablesManagement />}

        {/* Users Tab */}
        {activeTab === 'users' && <UsersManagement />}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
