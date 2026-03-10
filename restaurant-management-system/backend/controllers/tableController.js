import Table from '../models/Table.js';

// @desc    Get all tables
// @access  Private/Admin
export const getAllTables = async (req, res) => {
  try {
    const tables = await Table.find().sort({ tableNumber: 1 });
    res.json(tables);
  } catch (error) {
    console.error('Error fetching tables:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Create new table
// @access  Private/Admin
export const createTable = async (req, res) => {
  try {
    const { tableNumber, capacity, qrCode, location } = req.body;

    if (!tableNumber || !capacity || !location) {
      return res.status(400).json({ message: 'Table number, capacity, and location are required' });
    }

    // Auto-generate QR code if not provided
    const generatedQRCode = qrCode || `https://restaurant.example.com/table/${tableNumber}`;

    const table = new Table({
      tableNumber,
      capacity,
      location,
      qrCode: generatedQRCode,
      status: 'available'
    });

    const savedTable = await table.save();
    res.status(201).json(savedTable);
  } catch (error) {
    console.error('Error creating table:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get table by ID
// @access  Private/Admin
export const getTableById = async (req, res) => {
  try {
    const table = await Table.findById(req.params.id);

    if (!table) {
      return res.status(404).json({ message: 'Table not found' });
    }

    res.json(table);
  } catch (error) {
    console.error('Error fetching table:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update table
// @access  Private/Admin
export const updateTable = async (req, res) => {
  try {
    const { tableNumber, capacity, qrCode, status, location } = req.body;
    const { id } = req.params;

    if (!tableNumber || !capacity || !location) {
      return res.status(400).json({ message: 'Table number, capacity, and location are required' });
    }

    const updateData = { tableNumber, capacity, location };
    if (qrCode) {
      updateData.qrCode = qrCode;
    }
    if (status) {
      updateData.status = status;
    }

    const table = await Table.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!table) {
      return res.status(404).json({ message: 'Table not found' });
    }

    res.json(table);
  } catch (error) {
    console.error('Error updating table:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete table
// @access  Private/Admin
export const deleteTable = async (req, res) => {
  try {
    const table = await Table.findByIdAndDelete(req.params.id);

    if (!table) {
      return res.status(404).json({ message: 'Table not found' });
    }

    res.json({ message: 'Table deleted successfully' });
  } catch (error) {
    console.error('Error deleting table:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
