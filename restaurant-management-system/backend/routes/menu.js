import express from 'express';
import {
  getAllMenuItems,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
} from '../controllers/menuController.js';
import MenuItem from '../models/MenuItem.js';
import { verifyToken, authorizeRole } from '../middleware/auth.js';
import mongoose from 'mongoose';

const router = express.Router();

// @route   GET /api/menu/featured
// @desc    Get featured menu items
// @access  Public
router.get('/featured', async (req, res) => {
  try {
    console.log('📋 Fetching featured menu items...');
    console.log('Database connection state:', mongoose.connection.readyState);

    // Check database connection
    if (mongoose.connection.readyState !== 1) {
      console.error('❌ Database not connected');
      return res.status(500).json({
        message: 'Database connection error',
        error: 'Unable to connect to database'
      });
    }

    const limit = parseInt(req.query.limit) || 4;
    const items = await MenuItem.find({
      isFeatured: true,
      isAvailable: true
    })
      .limit(limit)
      .sort({ createdAt: -1 });

    console.log(`✅ Found ${items.length} featured items`);
    res.json(items);
  } catch (err) {
    console.error('❌ Error fetching featured items:', err.message);
    console.error('Full error:', err);

    // Handle specific errors
    if (err.name === 'MongoNetworkError' || err.name === 'MongoTimeoutError') {
      return res.status(503).json({
        message: 'Database connection error',
        error: 'Unable to connect to database'
      });
    }

    res.status(500).json({
      message: 'Failed to fetch featured items',
      error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message
    });
  }
});

// @route   GET /api/menu/favorites
// @desc    Get favorite menu items
// @access  Public
router.get('/favorites', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 8;
    const items = await MenuItem.find({
      isFavorite: true,
      isAvailable: true
    })
      .limit(limit)
      .sort({ createdAt: -1 });

    res.json(items);
  } catch (err) {
    console.error('Error fetching favorite items:', err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   GET /api/menu/categories
// @desc    Get all unique categories
// @access  Public
router.get('/categories', async (req, res) => {
  try {
    const categories = await MenuItem.distinct('category');
    res.json({ categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Failed to fetch categories' });
  }
});

router.get('/', getAllMenuItems);
router.get('/:id', getMenuItemById);

router.post('/', verifyToken, authorizeRole(['admin']), createMenuItem);
router.put('/:id', verifyToken, authorizeRole(['admin']), updateMenuItem);
router.delete('/:id', verifyToken, authorizeRole(['admin']), deleteMenuItem);

export default router;
