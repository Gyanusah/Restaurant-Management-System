import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const resetUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing users
    await User.deleteMany({});
    console.log('Cleared existing users');

    // Add new users including manager
    const users = [
      {
        name: 'Customer User',
        email: 'customer@test.com',
        password: 'password123',
        role: 'customer',
      },
      {
        name: 'Kitchen Staff',
        email: 'kitchen@test.com',
        password: 'password123',
        role: 'kitchen',
      },
      {
        name: 'Manager User',
        email: 'manager@test.com',
        password: 'password123',
        role: 'manager',
      },
      {
        name: 'Admin User',
        email: 'admin@test.com',
        password: 'password1234',
        role: 'admin',
      },
      {
        name: 'Gyanendra',
        email: 'gyanu@gmail.com',
        password: '123456789',
        phoneNumber: '9826753125',
        role: 'admin',
      },
    ];

    await User.insertMany(users);
    console.log('✅ Users reset with manager account added');

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error resetting users:', error);
  }
};

resetUsers();
