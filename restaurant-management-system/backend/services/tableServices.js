const Table = require('../models/Table');
const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');

// Generate QR code for a table
exports.generateTableQR = async (tableNumber) => {
  try {
    const table = await Table.findOne({ tableNumber });
    if (!table) {
      throw new Error('Table not found');
    }

    // Generate a unique token for this table session
    const sessionToken = uuidv4();
    table.sessionToken = sessionToken;
    table.isOccupied = true;
    await table.save();

    // Generate QR code data
    const qrData = JSON.stringify({
      tableId: table._id,
      tableNumber: table.tableNumber,
      sessionToken
    });

    // Generate QR code image
    const qrCodeUrl = await QRCode.toDataURL(qrData);
    return {
      qrCodeUrl,
      sessionToken,
      tableNumber: table.tableNumber
    };
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw error;
  }
};

// Verify table session
exports.verifyTableSession = async (tableId, sessionToken) => {
  const table = await Table.findById(tableId);
  if (!table || table.sessionToken !== sessionToken) {
    throw new Error('Invalid table session');
  }
  return table;
};