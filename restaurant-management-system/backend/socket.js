import { Server } from 'socket.io';

let io;

export const init = (server) => {
  console.log('🔌 Initializing Socket.IO server...');

  io = new Server(server, {
    cors: {
      origin: [
        'http://localhost:3000',
        'https://restaurant-management-system-gilt.vercel.app',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:5173',
        'https://localhost:3000',
        'https://127.0.0.1:3000'
      ],
      methods: ['GET', 'POST'],
      credentials: true
    },
    transports: ['websocket', 'polling'],
    allowEIO3: true,
    pingTimeout: 60000,
    pingInterval: 25000
  });

  io.on('connection', (socket) => {
    console.log('🔌 New client connected:', socket.id);
    console.log('🌐 Connected from:', socket.handshake.address);

    // Join table room
    socket.on('joinTable', (tableId) => {
      const roomName = `table_${tableId}`;
      socket.join(roomName);
      console.log(`🪑 Client ${socket.id} joined room: ${roomName}`);
    });

    // Join kitchen room
    socket.on('joinKitchen', () => {
      socket.join('kitchen');
      console.log('👨‍🍳 Kitchen staff connected:', socket.id);
    });

    // Join admin room
    socket.on('joinAdmin', () => {
      socket.join('admin');
      console.log('👨‍💼 Admin connected:', socket.id);
    });

    // Handle order status updates
    socket.on('updateOrderStatus', (data) => {
      console.log('📦 Order status update request:', data);
      // This would typically be handled by the order controller
    });

    socket.on('disconnect', (reason) => {
      console.log('🔌 Client disconnected:', socket.id, 'Reason:', reason);
    });

    socket.on('error', (error) => {
      console.error('🔌 Socket error for client', socket.id, ':', error);
    });
  });

  console.log('✅ Socket.IO server initialized successfully');
  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};