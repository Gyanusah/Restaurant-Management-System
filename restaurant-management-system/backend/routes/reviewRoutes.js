import express from 'express';
import {
  createReview,
  getCustomerReviews,
  getReviewsByCustomerPhone,
  getAllReviews,
  updateReview,
  deleteReview,
  getReviewStats
} from '../controllers/reviewController.js';

const router = express.Router();

// @route   POST /api/reviews
// @desc    Create new review
// @access  Public (customer)
router.post('/', createReview);

// @route   GET /api/reviews/customer/:customerId
// @desc    Get reviews by customer
// @access  Public (customer)
router.get('/customer/:customerId', getCustomerReviews);

// @route   GET /api/reviews/customer/phone/:phoneNumber
// @desc    Get reviews by customer phone number
// @access  Public
router.get('/customer/phone/:phoneNumber', getReviewsByCustomerPhone);

// @route   GET /api/reviews
// @desc    Get all reviews (for admin)
// @access  Private/Admin
router.get('/', getAllReviews);

// @route   PUT /api/reviews/:id
// @desc    Update review
// @access  Public (customer)
router.put('/:id', updateReview);

// @route   DELETE /api/reviews/:id
// @desc    Delete review
// @access  Public (customer)
router.delete('/:id', deleteReview);

// @route   GET /api/reviews/stats
// @desc    Get review statistics
// @access  Private/Admin
router.get('/stats', getReviewStats);

export default router;
