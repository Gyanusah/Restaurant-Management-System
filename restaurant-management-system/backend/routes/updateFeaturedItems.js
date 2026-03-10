import mongoose from 'mongoose';
import dotenv from 'dotenv';
import MenuItem from '../models/MenuItem.js';

dotenv.config();

const updateFeaturedItems = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Update some items to be featured
    const result = await MenuItem.updateMany(
      { name: { $in: ['Margherita Pizza', 'Caesar Salad', 'Chocolate Lava Cake'] } },
      { $set: { isFeatured: true } }
    );

    console.log(`Updated ${result.modifiedCount} menu items to be featured`);
    
    // Close the connection
    await mongoose.connection.close();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error updating featured items:', error);
    process.exit(1);
  }
};

updateFeaturedItems();
