import { Server } from 'socket.io';

let io;

export const init = (server) => {
  io = new Server(server, {
    cors: {
      origin: [
        'http://localhost:3000',
        'https://restaurant-management-system-gilt.vercel.app',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:5173'
      ],
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    // Join table room
    socket.on('joinTable', (tableId) => {
      socket.join(`table_${tableId}`);
      console.log(`Client joined table_${tableId}`);
    });

    // Join kitchen room
    socket.on('joinKitchen', () => {
      socket.join('kitchen');
      console.log('Kitchen staff connected');
    });

    // Join admin room
    socket.on('joinAdmin', () => {
      socket.join('admin');
      console.log('Admin connected');
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};