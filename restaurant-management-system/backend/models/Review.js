import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    trim: true,
    maxlength: 500
  },
  foodQuality: {
    type: Number,
    min: 1,
    max: 5
  },
  serviceQuality: {
    type: Number,
    min: 1,
    max: 5
  },
  ambiance: {
    type: Number,
    min: 1,
    max: 5
  },
  wouldRecommend: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Ensure one review per order per customer
reviewSchema.index({ customerId: 1, orderId: 1 }, { unique: true });

export default mongoose.model('Review', reviewSchema);
