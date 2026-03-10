import express from 'express';
import { verifyToken, authorizeRole } from '../middleware/auth.js';
import * as rawMaterialController from '../controllers/rawMaterialController.js';

const router = express.Router();

// Get all raw materials with filtering and pagination
router.get('/', verifyToken, authorizeRole(['admin', 'manager', 'kitchen']), rawMaterialController.getAllRawMaterials);

// Get raw material statistics
router.get('/statistics', verifyToken, authorizeRole(['admin', 'manager', 'kitchen']), rawMaterialController.getRawMaterialStatistics);

// Get low stock alerts
router.get('/alerts', verifyToken, authorizeRole(['admin', 'manager', 'kitchen']), rawMaterialController.getLowStockAlerts);

// Get raw material by ID
router.get('/:id', verifyToken, authorizeRole(['admin', 'manager', 'kitchen']), rawMaterialController.getRawMaterialById);

// Create new raw material
router.post('/', verifyToken, authorizeRole(['admin', 'manager']), rawMaterialController.createRawMaterial);

// Update raw material
router.put('/:id', verifyToken, authorizeRole(['admin', 'manager']), rawMaterialController.updateRawMaterial);

// Update stock levels
router.patch('/:id/stock', verifyToken, authorizeRole(['admin', 'manager', 'kitchen']), rawMaterialController.updateStock);

// Delete raw material
router.delete('/:id', verifyToken, authorizeRole(['admin']), rawMaterialController.deleteRawMaterial);

export default router;
