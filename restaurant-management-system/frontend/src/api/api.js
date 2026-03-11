import axios from 'axios';
import API from './axios';

// Auth APIs
export const signup = (data) => API.post('/auth/signup', data);
export const login = (data) => API.post('/auth/login', data);

// Menu APIs
export const getMenuItems = () => API.get('/menu');
export const getMenuItemById = (id) => API.get(`/menu/${id}`);
export const createMenuItem = (data) => API.post('/menu', data);
export const updateMenuItem = (id, data) => API.put(`/menu/${id}`, data);
export const deleteMenuItem = (id) => API.delete(`/menu/${id}`);

// Categories API
export const getCategories = async () => {
  try {
    const response = await API.get('/menu/categories');
    // Handle both response formats: array or object with categories property
    if (Array.isArray(response.data)) {
      return response.data;
    } else if (response.data && Array.isArray(response.data.categories)) {
      return response.data.categories.map(name => ({ name, _id: name }));
    }
    return [];
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
};

// Order APIs - without authentication for QR scanning
export const createOrder = (data) => {
  // Create a new axios instance without auth headers for order creation
  const orderAPI = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
    headers: {
      'Content-Type': 'application/json'
    }
  });

  // Add request interceptor for debugging
  orderAPI.interceptors.request.use((config) => {
    console.log('=== ORDER REQUEST ===');
    console.log('URL:', config.url);
    console.log('Method:', config.method);
    console.log('Data:', JSON.stringify(config.data, null, 2));
    console.log('Headers:', config.headers);
    return config;
  });

  return orderAPI.post('/orders', data);
};

export const getOrders = async () => {
  try {
    const response = await API.get('/orders');
    console.log('Orders API response:', response.data);
    // Backend returns { orders: [...], ... } so we need to extract the orders array
    return Array.isArray(response.data?.orders) ? response.data.orders : [];
  } catch (error) {
    console.error('Error fetching orders:', error);
    // Return empty array instead of failing the request
    return [];
  }
};

export const getOrderById = (id) => {
  if (!id) {
    console.error('No order ID provided');
    return Promise.reject(new Error('Order ID is required'));
  }
  return API.get(`/orders/${id}`);
};

export const customerLogin = async (credentials) => {
  try {
    const response = await API.post('/api/auth/customer/login', credentials);
    return response.data;
  } catch (error) {
    console.error('Customer login error:', error);
    throw error;
  }
};

export const getCustomerOrdersByPhone = async (phoneNumber) => {
  if (!phoneNumber) {
    console.error('Phone number is required');
    return Promise.reject(new Error('Phone number is required'));
  }
  try {
    console.log('=== API CALL: getCustomerOrdersByPhone ===');
    console.log('Phone number:', phoneNumber);
    console.log('API URL:', `/orders/customer/by-phone/${phoneNumber}`);

    const response = await API.get(`/orders/customer/by-phone/${phoneNumber}`);
    console.log('API response:', response);
    console.log('Response data:', response.data);
    console.log('Response data type:', typeof response.data);
    console.log('Is array:', Array.isArray(response.data));

    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error('=== API ERROR: getCustomerOrdersByPhone ===');
    console.error('Error:', error);
    console.error('Error response:', error.response);
    console.error('Error status:', error.response?.status);
    console.error('Error data:', error.response?.data);
    return [];
  }
};

export const getCustomerOrders = async () => {
  try {
    const response = await API.get('/orders/customer/orders');
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error('Error fetching customer orders:', error);
    return [];
  }
};

export const getOrdersByTable = async (tableNumber) => {
  if (!tableNumber) {
    console.error('Table number is required');
    return Promise.reject(new Error('Table number is required'));
  }
  try {
    const response = await API.get(`/orders/table/${tableNumber}`);
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error('Error fetching table orders:', error);
    return [];
  }
};

// Categories API
export const createCategory = async (categoryData) => {
  try {
    const response = await API.post('/categories', categoryData);
    return response.data;
  } catch (error) {
    console.error('Error creating category:', error);
    throw error;
  }
};

export const updateCategory = async (id, categoryData) => {
  try {
    const response = await API.put(`/categories/${id}`, categoryData);
    return response.data;
  } catch (error) {
    console.error('Error updating category:', error);
    throw error;
  }
};

export const deleteCategory = async (id) => {
  try {
    const response = await API.delete(`/categories/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting category:', error);
    throw error;
  }
};

// Tables API
export const getTables = async () => {
  try {
    const response = await API.get('/tables');
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error('Error fetching tables:', error);
    return [];
  }
};

export const createTable = async (tableData) => {
  try {
    const response = await API.post('/tables', tableData);
    return response.data;
  } catch (error) {
    console.error('Error creating table:', error);
    throw error;
  }
};

export const updateTable = async (id, tableData) => {
  try {
    const response = await API.put(`/tables/${id}`, tableData);
    return response.data;
  } catch (error) {
    console.error('Error updating table:', error);
    throw error;
  }
};

export const deleteTable = async (id) => {
  try {
    const response = await API.delete(`/tables/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting table:', error);
    throw error;
  }
};

// Users API
export const getUsers = async () => {
  try {
    const response = await API.get('/users');
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
};

export const createUser = async (userData) => {
  try {
    const response = await API.post('/users', userData);
    return response.data;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

export const updateUser = async (id, userData) => {
  try {
    const response = await API.put(`/users/${id}`, userData);
    return response.data;
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};

export const deleteUser = async (id) => {
  try {
    const response = await API.delete(`/users/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};

// Reviews API
export const getAllReviews = async () => {
  try {
    const response = await API.get('/reviews');
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error('Error fetching all reviews:', error);
    return [];
  }
};

export const createReview = async (reviewData) => {
  try {
    const response = await API.post('/reviews', reviewData);
    return response.data;
  } catch (error) {
    console.error('Error creating review:', error);
    throw error;
  }
};

export const getCustomerReviews = async (customerId) => {
  try {
    const response = await API.get(`/reviews/customer/${customerId}`);
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error('Error fetching customer reviews:', error);
    return [];
  }
};

export const getReviewsByCustomerPhone = async (phoneNumber) => {
  try {
    const response = await API.get(`/reviews/customer/phone/${phoneNumber}`);
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error('Error fetching reviews by phone:', error);
    return [];
  }
};

export const updateReview = async (id, reviewData) => {
  try {
    const response = await API.put(`/reviews/${id}`, reviewData);
    return response.data;
  } catch (error) {
    console.error('Error updating review:', error);
    throw error;
  }
};

export const deleteReview = async (id) => {
  try {
    const response = await API.delete(`/reviews/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting review:', error);
    throw error;
  }
};

export const getReviewStats = async () => {
  try {
    const response = await API.get('/reviews/stats');
    return response.data;
  } catch (error) {
    console.error('Error fetching review stats:', error);
    throw error;
  }
};

export const getFeaturedMenuItems = async () => {
  try {
    const response = await API.get('/menu/featured');
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error('Error fetching featured items:', error);
    return [];
  }
};

export const getFavoriteMenuItems = async () => {
  try {
    const response = await API.get('/menu/favorites');
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error('Error fetching favorite items:', error);
    return [];
  }
};

// Raw Materials API
export const getRawMaterials = async (params = {}) => {
  try {
    const queryString = new URLSearchParams(params).toString();
    const response = await API.get(`/raw-materials?${queryString}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching raw materials:', error);
    throw error;
  }
};

export const getRawMaterialById = async (id) => {
  try {
    const response = await API.get(`/raw-materials/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching raw material:', error);
    throw error;
  }
};

export const createRawMaterial = async (data) => {
  try {
    const response = await API.post('/raw-materials', data);
    return response.data;
  } catch (error) {
    console.error('Error creating raw material:', error);
    throw error;
  }
};

export const updateRawMaterial = async (id, data) => {
  try {
    const response = await API.put(`/raw-materials/${id}`, data);
    return response.data;
  } catch (error) {
    console.error('Error updating raw material:', error);
    throw error;
  }
};

export const deleteRawMaterial = async (id) => {
  try {
    const response = await API.delete(`/raw-materials/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting raw material:', error);
    throw error;
  }
};

export const updateRawMaterialStock = async (id, data) => {
  try {
    const response = await API.patch(`/raw-materials/${id}/stock`, data);
    return response.data;
  } catch (error) {
    console.error('Error updating raw material stock:', error);
    throw error;
  }
};

export const getRawMaterialStatistics = async () => {
  try {
    const response = await API.get('/raw-materials/statistics');
    return response.data;
  } catch (error) {
    console.error('Error fetching raw material statistics:', error);
    throw error;
  }
};

export const getLowStockAlerts = async () => {
  try {
    const response = await API.get('/raw-materials/alerts');
    return response.data;
  } catch (error) {
    console.error('Error fetching low stock alerts:', error);
    throw error;
  }
};

export const updateOrderStatus = (id, status) => {
  if (!id || !status) {
    console.error('Order ID and status are required');
    return Promise.reject(new Error('Order ID and status are required'));
  }
  return API.put(`/orders/${id}/status`, { status });
};

export const deleteOrder = (id) => {
  if (!id) {
    console.error('No order ID provided for deletion');
    return Promise.reject(new Error('Order ID is required'));
  }
  return API.delete(`/orders/${id}`);
};
