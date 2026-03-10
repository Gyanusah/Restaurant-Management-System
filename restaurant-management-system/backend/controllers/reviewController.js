import mongoose from 'mongoose';
import Review from '../models/Review.js';
import Order from '../models/Order.js';

// @desc    Create new review
// @access  Public (customer)
export const createReview = async (req, res) => {
  try {
    const { orderId, rating, comment, foodQuality, serviceQuality, ambiance, wouldRecommend } = req.body;
    const customerId = req.body.customerId;

    // Validate required fields
    if (!orderId || !rating || !customerId) {
      return res.status(400).json({ message: 'Order ID, rating, and customer ID are required' });
    }

    // Validate rating range
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    // Check if order exists and belongs to customer
    const order = await Order.findOne({ _id: orderId, customerId });
    if (!order) {
      return res.status(404).json({ message: 'Order not found or does not belong to this customer' });
    }

    // Check if order is completed (only completed orders can be reviewed)
    if (order.status !== 'completed') {
      return res.status(400).json({ message: 'Only completed orders can be reviewed' });
    }

    // Check if review already exists
    const existingReview = await Review.findOne({ customerId, orderId });
    if (existingReview) {
      return res.status(400).json({ message: 'Review already exists for this order' });
    }

    // Create new review
    const review = new Review({
      customerId,
      orderId,
      rating,
      comment: comment || '',
      foodQuality: foodQuality || rating,
      serviceQuality: serviceQuality || rating,
      ambiance: ambiance || rating,
      wouldRecommend: wouldRecommend || false
    });

    await review.save();

    // Populate review data for response
    await review.populate('customerId', 'name phoneNumber');
    await review.populate('orderId', 'orderNumber tableNumber totalAmount createdAt');

    res.status(201).json({
      message: 'Review created successfully',
      review
    });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get reviews by customer
// @access  Public (customer)
export const getCustomerReviews = async (req, res) => {
  try {
    const { customerId } = req.params;

    if (!customerId) {
      return res.status(400).json({ message: 'Customer ID is required' });
    }

    const reviews = await Review.find({ customerId })
      .populate('orderId', 'orderNumber tableNumber totalAmount createdAt')
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    console.error('Get customer reviews error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get reviews by customer phone number
// @access  Public
export const getReviewsByCustomerPhone = async (req, res) => {
  try {
    const { phoneNumber } = req.params;

    if (!phoneNumber) {
      return res.status(400).json({ message: 'Phone number is required' });
    }

    // Find customer by phone number
    const User = mongoose.model('User');
    const customer = await User.findOne({ phoneNumber, role: 'customer' });

    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    // Get reviews for this customer
    const reviews = await Review.find({ customerId: customer._id })
      .populate('orderId', 'orderNumber tableNumber totalAmount createdAt')
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    console.error('Get reviews by customer phone error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all reviews (for admin)
// @access  Private/Admin
export const getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find({})
      .populate('customerId', 'name phoneNumber')
      .populate('orderId', 'orderNumber tableNumber totalAmount createdAt')
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    console.error('Get all reviews error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update review
// @access  Public (customer)
export const updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment, foodQuality, serviceQuality, ambiance, wouldRecommend } = req.body;
    const customerId = req.body.customerId;

    // Find review and ensure it belongs to the customer
    const review = await Review.findOne({ _id: id, customerId });
    if (!review) {
      return res.status(404).json({ message: 'Review not found or access denied' });
    }

    // Update fields
    if (rating !== undefined) {
      if (rating < 1 || rating > 5) {
        return res.status(400).json({ message: 'Rating must be between 1 and 5' });
      }
      review.rating = rating;
    }

    if (comment !== undefined) review.comment = comment;
    if (foodQuality !== undefined) review.foodQuality = foodQuality;
    if (serviceQuality !== undefined) review.serviceQuality = serviceQuality;
    if (ambiance !== undefined) review.ambiance = ambiance;
    if (wouldRecommend !== undefined) review.wouldRecommend = wouldRecommend;

    await review.save();

    await review.populate('customerId', 'name phoneNumber');
    await review.populate('orderId', 'orderNumber tableNumber totalAmount createdAt');

    res.json({
      message: 'Review updated successfully',
      review
    });
  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete review
// @access  Public (customer)
export const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const customerId = req.body.customerId;

    // Find review and ensure it belongs to the customer
    const review = await Review.findOne({ _id: id, customerId });
    if (!review) {
      return res.status(404).json({ message: 'Review not found or access denied' });
    }

    await Review.findByIdAndDelete(id);

    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get review statistics
// @access  Private/Admin
export const getReviewStats = async (req, res) => {
  try {
    const stats = await Review.aggregate([
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
          averageFoodQuality: { $avg: '$foodQuality' },
          averageServiceQuality: { $avg: '$serviceQuality' },
          averageAmbiance: { $avg: '$ambiance' },
          recommendationRate: {
            $avg: { $cond: [{ $eq: ['$wouldRecommend', true] }, 1, 0] }
          }
        }
      }
    ]);

    const ratingDistribution = await Review.aggregate([
      {
        $group: {
          _id: '$rating',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    res.json({
      stats: stats[0] || {
        averageRating: 0,
        totalReviews: 0,
        averageFoodQuality: 0,
        averageServiceQuality: 0,
        averageAmbiance: 0,
        recommendationRate: 0
      },
      ratingDistribution
    });
  } catch (error) {
    console.error('Get review stats error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
