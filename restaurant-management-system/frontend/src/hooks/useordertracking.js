import { useState, useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';

export const useOrderTracking = (tableId, userRole) => {
  const [socket, setSocket] = useState(null);
  const [orderStatus, setOrderStatus] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const socketUrl = process.env.NODE_ENV === 'production'
      ? window.location.origin
      : 'http://localhost:5000';
    const newSocket = io(socketUrl);
    setSocket(newSocket);

    return () => newSocket.close();
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleConnect = () => {
      console.log('Connected to WebSocket');
      setIsConnected(true);

      // Join appropriate room based on user role
      if (tableId) {
        socket.emit('joinTable', tableId);
      } else if (userRole === 'kitchen') {
        socket.emit('joinKitchen');
      } else if (userRole === 'admin') {
        socket.emit('joinAdmin');
      }
    };

    const handleOrderUpdate = (update) => {
      console.log('Order update received:', update);
      setOrderStatus(update.status);
    };

    socket.on('connect', handleConnect);
    socket.on('orderStatusUpdate', handleOrderUpdate);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('orderStatusUpdate', handleOrderUpdate);
    };
  }, [socket, tableId, userRole]);

  const updateOrderStatus = useCallback((orderId, newStatus) => {
    if (!socket || !isConnected) return;

    socket.emit('updateOrderStatus', {
      orderId,
      status: newStatus
    });
  }, [socket, isConnected]);

  return { orderStatus, updateOrderStatus, isConnected };
};
