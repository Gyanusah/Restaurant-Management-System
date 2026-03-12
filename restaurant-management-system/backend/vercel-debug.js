// // Vercel Environment Debug Script
// console.log('🔍 Vercel Environment Debug');
// console.log('NODE_ENV:', process.env.NODE_ENV);
// console.log('MONGODB_URI exists:', !!process.env.MONGODB_URI);
// console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);
// console.log('PORT:', process.env.PORT);

// // Test database connection
// import mongoose from 'mongoose';

// async function testConnection() {
//     try {
//         console.log('Testing MongoDB connection...');
//         await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/test', {
//             useNewUrlParser: true,
//             useUnifiedTopology: true,
//             serverSelectionTimeoutMS: 5000,
//         });
//         console.log('✅ Database connection successful');
        
//         // Test MenuItem model
//         const MenuItem = (await import('../models/MenuItem.js')).default;
//         const count = await MenuItem.countDocuments();
//         console.log('✅ MenuItem model working, documents:', count);
        
//         process.exit(0);
//     } catch (error) {
//         console.error('❌ Connection test failed:', error.message);
//         process.exit(1);
//     }
// }

// testConnection();
