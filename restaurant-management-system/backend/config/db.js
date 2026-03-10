import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        console.log('Connecting to MongoDB...');
        const connection = await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });
        console.log('✓ MongoDB Connected Successfully');
        console.log(`Connected to database: ${process.env.MONGODB_URI}`);
        return connection;
    } catch (error) {
        console.error('✗ MongoDB Connection Error:', error.message);
        console.error('');
        console.error('TROUBLESHOOTING:');
        console.error('1. Make sure MongoDB is running (start-mongodb.bat)');
        console.error('2. Check that MongoDB can be accessed at: mongodb://localhost:27017');
        console.error('3. Verify the MONGODB_URI in .env file');
        console.error('');
        console.error('To start MongoDB on Windows:');
        console.error('  - Run: start-mongodb.bat');
        console.error('  - Or run: net start MongoDB');
        console.error('');

        // Don't exit, allow the server to continue running
        // This way the frontend can still work and show proper error messages
        // setTimeout(() => {
        //     process.exit(1);
        // }, 1000);
    }
};

export default connectDB;
