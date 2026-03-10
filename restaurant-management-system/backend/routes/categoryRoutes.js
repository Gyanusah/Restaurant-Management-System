import express from 'express';
import {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory
} from '../controllers/categoryController.js';
import { verifyToken, authorizeRole } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/categories
// @desc    Get all categories
// @access  Private/Admin
router.get('/', verifyToken, authorizeRole(['admin']), getAllCategories);

// @route   POST /api/categories
// @desc    Create new category
// @access  Private/Admin
router.post('/', verifyToken, authorizeRole(['admin']), createCategory);

// @route   GET /api/categories/:id
// @desc    Get category by ID
// @access  Private/Admin
router.get('/:id', verifyToken, authorizeRole(['admin']), getCategoryById);

// @route   PUT /api/categories/:id
// @desc    Update category
// @access  Private/Admin
router.put('/:id', verifyToken, authorizeRole(['admin']), updateCategory);

// @route   DELETE /api/categories/:id
// @desc    Delete category
// @access  Private/Admin
router.delete('/:id', verifyToken, authorizeRole(['admin']), deleteCategory);

export default router;
