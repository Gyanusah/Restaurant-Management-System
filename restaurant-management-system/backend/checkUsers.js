import mongoose from 'mongoose';
import User from './models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const checkUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/restaurant-management');
    console.log('Connected to MongoDB');

    // Find all users
    const users = await User.find({});
    console.log('Total users found:', users.length);
    
    users.forEach(user => {
      console.log('User:', {
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role
      });
    });

    // Check specifically for the phone number
    const userWithPhone = await User.findOne({ phoneNumber: '9826753125' });
    console.log('\n=== Checking for phone 9826753125 ===');
    if (userWithPhone) {
      console.log('✅ Found user:', userWithPhone);
    } else {
      console.log('❌ No user found with phone 9826753125');
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
};

checkUsers();
