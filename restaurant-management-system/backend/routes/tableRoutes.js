import express from 'express';
import {
  createTable,
  getAllTables,
  getTableById,
  updateTable,
  deleteTable
} from '../controllers/tableController.js';
import { verifyToken, authorizeRole } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/tables
// @desc    Get all tables
// @access  Private/Admin
router.get('/', verifyToken, authorizeRole(['admin']), getAllTables);

// @route   POST /api/tables
// @desc    Create new table
// @access  Private/Admin
router.post('/', verifyToken, authorizeRole(['admin']), createTable);

// @route   GET /api/tables/:id
// @desc    Get table by ID
// @access  Private/Admin
router.get('/:id', verifyToken, authorizeRole(['admin']), getTableById);

// @route   PUT /api/tables/:id
// @desc    Update table
// @access  Private/Admin
router.put('/:id', verifyToken, authorizeRole(['admin']), updateTable);

// @route   DELETE /api/tables/:id
// @desc    Delete table
// @access  Private/Admin
router.delete('/:id', verifyToken, authorizeRole(['admin']), deleteTable);

export default router;
