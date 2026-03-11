import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import seedDatabase from './seeds/seedDatabase.js';
import { checkDBConnection } from './middleware/dbCheck.js';
import authRoutes from './routes/auth.js';
import menuRoutes from './routes/menu.js';
import orderRoutes from './routes/order.js';
import userRoutes from './routes/users.js';
import categoryRoutes from './routes/categoryRoutes.js';
import tableRoutes from './routes/tableRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import rawMaterialRoutes from './routes/rawMaterial.js';
import mongoose from 'mongoose';
import { init } from './socket.js';

dotenv.config();

const app = express();

// Request logging middleware
app.use((req, res, next) => {
    console.log('=== INCOMING REQUEST ===');
    console.log('Method:', req.method);
    console.log('URL:', req.url);
    console.log('Origin:', req.headers.origin);
    next();
});
// CORS Middleware
app.use(cors({
    origin: function (origin, callback) {
        console.log('=== CORS DEBUG ===');
        console.log('Request origin:', origin);

        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) {
            console.log('No origin - allowing');
            return callback(null, true);
        }

        // Allow specific origins
        if (origin === 'http://localhost:3000' ||
            origin === 'https://restaurant-management-system-82cn.vercel.app' ||
            origin.startsWith('http://localhost:') ||
            origin.startsWith('http://127.0.0.1:')) {
            console.log('Origin allowed:', origin);
            return callback(null, true);
        }

        console.log('Origin blocked:', origin);
        callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['X-Total-Count', 'X-Page-Count']
}));

// Handle preflight requests
app.options('*', (req, res) => {
    res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.send(200);
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
    console.log('=== INCOMING REQUEST ===');
    console.log('Method:', req.method);
    console.log('URL:', req.url);
    console.log('Origin:', req.headers.origin);
    console.log('Body:', req.body);
    console.log('========================');
    next();
});

// Database Connection with better error handling
console.log('🚀 Starting Restaurant Management System...');
console.log('Attempting to connect to MongoDB...');
console.log('MongoDB URI:', process.env.MONGODB_URI);

connectDB();

// Seed database after connection
setTimeout(() => {
    seedDatabase();
}, 2000);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/tables', tableRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/raw-materials', rawMaterialRoutes);

// Test route to verify server is working
app.get('/test', (req, res) => {
    console.log('=== MAIN SERVER TEST ROUTE HIT ===');
    res.json({
        message: 'Main server working',
        timestamp: new Date().toISOString(),
        routes: ['auth', 'users', 'orders', 'menu', 'categories', 'tables', 'reviews', 'raw-materials']
    });
});

// Health Check
app.get('/', (req, res) => {
    res.status(200).json({ message: 'Server is running' });
});

// Simple health check without CORS
app.get('/ping', (req, res) => {
    console.log('=== PING REQUEST ===');
    console.log('Request headers:', req.headers);
    res.status(200).json({
        message: 'pong',
        timestamp: new Date().toISOString(),
        server: 'restaurant-management-backend'
    });
});

app.get('/db-status', (req, res) => {
    try {
        const isConnected = mongoose.connection.readyState === 1;
        res.status(200).json({
            message: isConnected ? 'MongoDB is connected' : 'MongoDB is not connected',
            connected: isConnected,
            hint: !isConnected ? 'Run "start-mongodb.bat" to start MongoDB service' : undefined
        });
    } catch (err) {
        res.status(500).json({ message: 'Failed to check database status', error: err.message });
    }
});

// 404 Handler
app.use((req, res, next) => {
    console.log('=== 404 HANDLER ===');
    console.log('Method:', req.method);
    console.log('URL:', req.url);
    console.log('Path:', req.path);
    console.log('Original URL:', req.originalUrl);
    console.log('Query:', req.query);
    console.log('Headers:', req.headers);

    res.status(404).json({ message: 'Route not found', path: req.path, url: req.url });
});

// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error('⚠️  Server Error:', err.message);
    console.error('Error Stack:', err.stack);
    console.error('Request:', req.method, req.path);
    console.error('Body:', req.body);

    res.status(err.status || 500).json({
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : 'An error occurred',
        path: req.path,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });
});

// const PORT = process.env.PORT || 5000;

// const server = app.listen(PORT, () => {
//     console.log(`\n✅ Server running on port ${PORT}`);
//     console.log(`📍 Environment: ${process.env.NODE_ENV}`);
//     console.log(`🏥 Health Check: http://localhost:${PORT}/api/health`);
//     console.log(`💾 DB Status: http://localhost:${PORT}/api/db-status`);
//     console.log('\nWaiting for MongoDB connection...\n');

//     // Initialize Socket.io
//     init(server);
//     console.log('🔌 Socket.io initialized');
// });

// // Handle server errors
// server.on('error', (err) => {
//     console.error('🔴 Server error:', err);
//     if (err.code === 'EADDRINUSE') {
//         console.error(`❌ Port ${PORT} is already in use`);
//         console.error('Try changing PORT in .env file or kill the process using that port');
//     }
// });

export default app;
