import mongoose from 'mongoose';
import RawMaterial from '../models/RawMaterial.js';

// Get all raw materials with filtering and pagination
export const getAllRawMaterials = async (req, res) => {
  try {
    console.log('=== RAW MATERIALS DEBUG ===');
    console.log('Request query:', req.query);

    const {
      page = 1,
      limit = 10,
      category,
      status,
      supplier,
      sortBy = 'name',
      sortOrder = 'asc',
      search
    } = req.query;

    console.log('Parsed parameters:', { page, limit, category, status, supplier, sortBy, sortOrder, search });

    // Build filter object
    const filter = {};
    if (category) filter.category = category;
    if (status) filter.status = status;
    if (supplier) filter.supplier = { $regex: supplier, $options: 'i' };
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { supplier: { $regex: search, $options: 'i' } }
      ];
    }

    console.log('Filter object:', filter);

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    console.log('Sort object:', sort);

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    console.log('Pagination skip:', skip, 'limit:', parseInt(limit));

    console.log('Executing database queries...');

    // Execute query
    const [materials, total] = await Promise.all([
      RawMaterial.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .populate('addedBy', 'name email'),
      RawMaterial.countDocuments(filter)
    ]);

    console.log('Query results - Materials count:', materials.length, 'Total:', total);

    console.log('Calculating statistics...');
    // Calculate statistics
    const statistics = await getRawMaterialStatisticsHelper();
    console.log('Statistics calculated:', statistics);

    console.log('✅ Raw materials fetched successfully');

    res.json({
      materials,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      },
      statistics
    });
  } catch (error) {
    console.error('❌ Error fetching raw materials:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get raw material by ID
export const getRawMaterialById = async (req, res) => {
  try {
    const material = await RawMaterial.findById(req.params.id)
      .populate('addedBy', 'name email');

    if (!material) {
      return res.status(404).json({ message: 'Raw material not found' });
    }

    res.json(material);
  } catch (error) {
    console.error('Error fetching raw material:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create new raw material
export const createRawMaterial = async (req, res) => {
  try {
    const materialData = {
      ...req.body,
      addedBy: req.user.id
    };

    const material = new RawMaterial(materialData);
    await material.save();

    const populatedMaterial = await RawMaterial.findById(material._id)
      .populate('addedBy', 'name email');

    res.status(201).json({
      message: 'Raw material created successfully',
      material: populatedMaterial
    });
  } catch (error) {
    console.error('Error creating raw material:', error);
    res.status(400).json({
      message: 'Error creating raw material',
      error: error.message
    });
  }
};

// Update raw material
export const updateRawMaterial = async (req, res) => {
  try {
    const material = await RawMaterial.findById(req.params.id);

    if (!material) {
      return res.status(404).json({ message: 'Raw material not found' });
    }

    const updatedMaterial = await RawMaterial.findByIdAndUpdate(
      req.params.id,
      { ...req.body, lastRestocked: Date.now() },
      { new: true, runValidators: true }
    ).populate('addedBy', 'name email');

    res.json({
      message: 'Raw material updated successfully',
      material: updatedMaterial
    });
  } catch (error) {
    console.error('Error updating raw material:', error);
    res.status(400).json({
      message: 'Error updating raw material',
      error: error.message
    });
  }
};

// Delete raw material
export const deleteRawMaterial = async (req, res) => {
  try {
    const material = await RawMaterial.findById(req.params.id);

    if (!material) {
      return res.status(404).json({ message: 'Raw material not found' });
    }

    await RawMaterial.findByIdAndDelete(req.params.id);

    res.json({
      message: 'Raw material deleted successfully',
      material
    });
  } catch (error) {
    console.error('Error deleting raw material:', error);
    res.status(500).json({
      message: 'Error deleting raw material',
      error: error.message
    });
  }
};

// Update stock levels
export const updateStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity, operation } = req.body; // operation: 'add' or 'subtract'

    const material = await RawMaterial.findById(id);

    if (!material) {
      return res.status(404).json({ message: 'Raw material not found' });
    }

    const currentStock = material.currentStock;
    let newStock;

    if (operation === 'add') {
      newStock = currentStock + parseFloat(quantity);
    } else if (operation === 'subtract') {
      newStock = currentStock - parseFloat(quantity);
      if (newStock < 0) {
        return res.status(400).json({ message: 'Insufficient stock' });
      }
    } else {
      return res.status(400).json({ message: 'Invalid operation' });
    }

    material.currentStock = newStock;
    material.lastRestocked = Date.now();
    await material.save();

    res.json({
      message: `Stock ${operation === 'add' ? 'added to' : 'subtracted from'} successfully`,
      previousStock: currentStock,
      newStock,
      material
    });
  } catch (error) {
    console.error('Error updating stock:', error);
    res.status(500).json({
      message: 'Error updating stock',
      error: error.message
    });
  }
};

// Get raw material statistics
export const getRawMaterialStatistics = async (req, res) => {
  try {
    const statistics = await getRawMaterialStatisticsHelper();
    res.json(statistics);
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({
      message: 'Error fetching statistics',
      error: error.message
    });
  }
};

// Helper function to get statistics
async function getRawMaterialStatisticsHelper() {
  console.log('=== STATISTICS DEBUG ===');

  try {
    console.log('Starting statistics calculations...');

    const [
      totalMaterials,
      inStock,
      lowStock,
      outOfStock,
      expired,
      categoryStats,
      totalValue
    ] = await Promise.all([
      RawMaterial.countDocuments(),
      RawMaterial.countDocuments({ status: 'In Stock' }),
      RawMaterial.countDocuments({ status: 'Low Stock' }),
      RawMaterial.countDocuments({ status: 'Out of Stock' }),
      RawMaterial.countDocuments({ status: 'Expired' }),
      RawMaterial.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      RawMaterial.aggregate([
        {
          $group: {
            _id: null,
            totalValue: { $sum: { $multiply: ['$currentStock', '$unitCost'] } }
          }
        }
      ])
    ]);

    console.log('Statistics results:', {
      totalMaterials,
      inStock,
      lowStock,
      outOfStock,
      expired,
      categoryStats: categoryStats.length,
      totalValue: totalValue[0]?.totalValue || 0
    });

    console.log('Fetching low stock items...');

    const lowStockItems = await RawMaterial.find({
      $or: [
        { currentStock: { $lte: 0 } },
        { stockStatus: 'Out of Stock' }
      ]
    }).limit(10).select('name currentStock minimumStock unit category');

    console.log('Low stock items count:', lowStockItems.length);

    const result = {
      totalMaterials,
      stockStatus: {
        inStock,
        lowStock,
        outOfStock,
        expired
      },
      categoryBreakdown: categoryStats,
      totalInventoryValue: totalValue[0]?.totalValue || 0,
      lowStockItems
    };

    console.log('✅ Statistics calculated successfully');
    return result;
  } catch (error) {
    console.error('❌ Error in statistics helper:', error);
    console.error('Error stack:', error.stack);
    throw error;
  }
}

// Get low stock alerts
export const getLowStockAlerts = async (req, res) => {
  try {
    const lowStockItems = await RawMaterial.find({
      $or: [
        { currentStock: { $lte: 0 } },
        { stockStatus: 'Low Stock' },
        { stockStatus: 'Out of Stock' }
      ]
    })
      .populate('addedBy', 'name email')
      .sort({ currentStock: 1 });

    res.json({
      message: 'Low stock items retrieved',
      items: lowStockItems,
      total: lowStockItems.length
    });
  } catch (error) {
    console.error('Error fetching low stock alerts:', error);
    res.status(500).json({
      message: 'Error fetching low stock alerts',
      error: error.message
    });
  }
};
