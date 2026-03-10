// src/services/orderService.js
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const getOrders = async () => {
  const response = await axios.get(`${API_URL}/orders`);
  return response.data;
};

export const getKitchenOrders = async () => {
  const response = await axios.get(`${API_URL}/orders/kitchen`);
  return response.data;
};

export const updateOrderStatus = async (orderId, statusData) => {
  const response = await axios.put(`${API_URL}/orders/${orderId}/status`, statusData);
  return response.data;
};