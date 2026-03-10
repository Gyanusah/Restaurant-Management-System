import mongoose from 'mongoose';

const tableSchema = new mongoose.Schema({
  tableNumber: {
    type: Number,
    required: true,
    unique: true,
    min: 1
  },
  capacity: {
    type: Number,
    required: true,
    min: 1,
    max: 12
  },
  status: {
    type: String,
    enum: ['available', 'occupied', 'reserved', 'out-of-service'],
    default: 'available'
  },
  location: {
    type: String,
    enum: ['indoor', 'outdoor', 'patio', 'bar'],
    required: true
  },
  qrCode: {
    type: String,
    unique: true
  },
  currentOrder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    default: null
  },
  lastUsed: {
    type: Date,
    default: null
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for faster queries on tableNumber and status
tableSchema.index({ tableNumber: 1, status: 1 });

// Virtual for getting active orders for this table
tableSchema.virtual('activeOrders', {
  ref: 'Order',
  localField: '_id',
  foreignField: 'table',
  match: { status: { $in: ['pending', 'confirmed', 'preparing', 'ready'] } }
});

// Method to check if table is available
tableSchema.methods.isAvailable = function() {
  return this.status === 'available';
};

// Method to occupy table
tableSchema.methods.occupy = function() {
  this.status = 'occupied';
  this.lastUsed = new Date();
  return this.save();
};

// Method to free table
tableSchema.methods.free = function() {
  this.status = 'available';
  this.currentOrder = null;
  return this.save();
};

// Pre-save hook to ensure table number is unique
tableSchema.pre('save', async function(next) {
  if (this.isModified('tableNumber')) {
    const existingTable = await this.constructor.findOne({ tableNumber: this.tableNumber });
    if (existingTable && existingTable._id.toString() !== this._id.toString()) {
      const error = new Error('Table number already exists');
      return next(error);
    }
  }
  next();
});

const Table = mongoose.model('Table', tableSchema);

export default Table;
