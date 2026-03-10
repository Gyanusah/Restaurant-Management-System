import mongoose from 'mongoose';

const rawMaterialSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Vegetables', 'Fruits', 'Meat', 'Dairy', 'Grains', 'Spices', 'Oils', 'Beverages', 'Other']
  },
  unit: {
    type: String,
    required: true,
    enum: ['kg', 'liters', 'pieces', 'dozens', 'boxes', 'bags', 'bottles']
  },
  currentStock: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  minimumStock: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  maximumStock: {
    type: Number,
    required: true,
    min: 0
  },
  unitCost: {
    type: Number,
    required: true,
    min: 0
  },
  supplier: {
    type: String,
    required: true,
    trim: true
  },
  lastRestocked: {
    type: Date,
    default: Date.now
  },
  expiryDate: {
    type: Date
  },
  location: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['In Stock', 'Low Stock', 'Out of Stock', 'Expired'],
    default: 'In Stock'
  },
  description: {
    type: String,
    trim: true
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Indexes for better performance
rawMaterialSchema.index({ name: 1 });
rawMaterialSchema.index({ category: 1 });
rawMaterialSchema.index({ status: 1 });
rawMaterialSchema.index({ supplier: 1 });

// Virtual for stock percentage
rawMaterialSchema.virtual('stockPercentage').get(function () {
  if (this.maximumStock === 0) return 0;
  return ((this.currentStock / this.maximumStock) * 100).toFixed(2);
});

// Virtual for stock status
rawMaterialSchema.virtual('stockStatus').get(function () {
  if (this.currentStock === 0) return 'Out of Stock';
  if (this.currentStock <= this.minimumStock) return 'Low Stock';
  if (this.expiryDate && new Date() > this.expiryDate) return 'Expired';
  return 'In Stock';
});

// Pre-save middleware to update status
rawMaterialSchema.pre('save', function (next) {
  this.status = this.stockStatus;
  next();
});

export default mongoose.model('RawMaterial', rawMaterialSchema);
