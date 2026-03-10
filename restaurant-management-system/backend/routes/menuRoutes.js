// backend/routes/menuRoutes.js
import express from 'express';
import MenuItem from '../models/MenuItem.js';

const router = express.Router();

// @route   GET /api/menu/featured
// @desc    Get featured menu items
// @access  Public
router.get('/featured', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 4;
    const items = await MenuItem.find({ 
      isFeatured: true,
      isAvailable: true 
    })
      .limit(limit)
      .sort({ createdAt: -1 });
    
    if (!items || items.length === 0) {
      return res.status(404).json({ message: 'No featured items found' });
    }
    
    res.json(items);
  } catch (err) {
    console.error('Error fetching featured items:', err.message);
    res.status(500).json({ 
      message: 'Server Error',
      error: process.env.NODE_ENV === 'development' ? err.message : {}
    });
  }
});

// @route   GET /api/menu
// @desc    Get all menu items
// @access  Public
router.get('/', async (req, res) => {
  try {
    const items = await MenuItem.find();
    res.json(items);
  } catch (err) {
    console.error(err.message);
    console.error('Error fetching menu items:', err.message);
    res.status(500).json({ 
      message: 'Server Error',
      error: process.env.NODE_ENV === 'development' ? err.message : {}
    });
  }
});

export default router;