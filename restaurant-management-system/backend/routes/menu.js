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

    res.json(items);
  } catch (err) {
    console.error('Error fetching featured items:', err.message);
    res.status(500).json({ message: 'Server Error' });
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
