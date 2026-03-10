import mongoose from 'mongoose';

let dbConnected = false;

mongoose.connection.on('connected', () => {
    dbConnected = true;
    console.log('✓ MongoDB connected');
});

mongoose.connection.on('disconnected', () => {
    dbConnected = false;
    console.log('✗ MongoDB disconnected');
});

mongoose.connection.on('error', (err) => {
    dbConnected = false;
    console.error('✗ MongoDB error:', err.message);
});

export const checkDBConnection = (req, res, next) => {
    if (!dbConnected) {
        return res.status(503).json({
            message: 'Database connection error',
            error: 'MongoDB is not connected. Please ensure MongoDB is running on localhost:27017',
            help: 'Run "start-mongodb.bat" to start MongoDB service'
        });
    }
    next();
};

export const getDBStatus = () => dbConnected;
