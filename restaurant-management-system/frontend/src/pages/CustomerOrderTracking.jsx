import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import { getOrder } from '../services/orderService';

// Inline hook to bypass import issue
const useOrderTrackingInline = (tableId, userRole) => {
  const [socket, setSocket] = useState(null);
  const [orderStatus, setOrderStatus] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const socketUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

    const newSocket = io(socketUrl, {
      transports: ["websocket"],
    });

    setSocket(newSocket);

    return () => newSocket.disconnect();
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

const statusStages = [
  { id: 1, status: 'pending', label: 'Order Received', description: 'We have received your order' },
  { id: 2, status: 'preparing', label: 'Preparing', description: 'Chef is working on your order' },
  { id: 3, status: 'ready', label: 'Ready', description: 'Your order is ready' },
  { id: 4, status: 'completed', label: 'Completed', description: 'Thank you for dining with us!' },
];

const CustomerOrderTracking = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const { orderStatus, isConnected } = useOrderTrackingInline(order?.table?._id, 'customer');

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const data = await getOrder(orderId);
        setOrder(data);
      } catch (error) {
        console.error('Error fetching order:', error);
      }
    };

    fetchOrder();
  }, [orderId]);

  const currentStatusIndex = statusStages.findIndex(stage => stage.status === (orderStatus || order?.status));
  const isActive = (index) => index < currentStatusIndex;
  const isCurrent = (index) => index === currentStatusIndex;

  if (!order) return <div>Loading...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Order #{order.orderNumber}</h1>
      
      <div className="mb-8">
        <div className="flex justify-between mb-2">
          <span className="text-gray-600">Table</span>
          <span className="font-medium">Table {order.table?.tableNumber}</span>
        </div>
        <div className="flex justify-between mb-2">
          <span className="text-gray-600">Status</span>
          <span className={`font-medium ${
            order.status === 'completed' ? 'text-green-600' : 
            order.status === 'preparing' ? 'text-yellow-600' : 'text-blue-600'
          }`}>
            {order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
          </span>
        </div>
      </div>

      <div className="relative">
        {statusStages.map((stage, index) => (
          <div key={stage.id} className="flex items-start mb-6">
            <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center mr-4 ${
              isActive(index) ? 'bg-green-500 text-white' : 
              isCurrent(index) ? 'bg-blue-500 text-white' : 'bg-gray-200'
            }`}>
              {isActive(index) ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <span>{index + 1}</span>
              )}
            </div>
            <div>
              <h3 className={`font-medium ${
                isCurrent(index) ? 'text-blue-600' : isActive(index) ? 'text-green-600' : 'text-gray-500'
              }`}>
                {stage.label}
              </h3>
              <p className="text-sm text-gray-500">{stage.description}</p>
            </div>
          </div>
        ))}
      </div>

      {!isConnected && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                Connection lost. Trying to reconnect...
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerOrderTracking;