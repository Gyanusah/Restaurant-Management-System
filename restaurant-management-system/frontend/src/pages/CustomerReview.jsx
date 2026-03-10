import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { createReview, getReviewsByCustomerPhone } from '../api/api';

const CustomerReview = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [customerInfo, setCustomerInfo] = useState(null);
  const [order, setOrder] = useState(null);
  const [rating, setRating] = useState(5);
  const [foodQuality, setFoodQuality] = useState(5);
  const [serviceQuality, setServiceQuality] = useState(5);
  const [ambiance, setAmbiance] = useState(5);
  const [comment, setComment] = useState('');
  const [wouldRecommend, setWouldRecommend] = useState(false);
  const [loading, setLoading] = useState(false);
  const [existingReview, setExistingReview] = useState(null);

  useEffect(() => {
    // Get customer info from localStorage
    const storedCustomerInfo = localStorage.getItem('customerInfo');
    if (storedCustomerInfo) {
      setCustomerInfo(JSON.parse(storedCustomerInfo));
    } else {
      toast.error('Please log in to review orders');
      navigate('/customer-login');
      return;
    }

    // Get order details (you might need to pass this as prop or fetch it)
    if (orderId) {
      // For now, we'll assume order exists and is completed
      setOrder({ _id: orderId });
    }
  }, [orderId, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!customerInfo || !order) {
      toast.error('Missing customer or order information');
      return;
    }

    setLoading(true);
    
    try {
      const reviewData = {
        orderId: order._id,
        customerId: customerInfo.customerId,
        rating,
        comment: comment.trim(),
        foodQuality,
        serviceQuality,
        ambiance,
        wouldRecommend
      };

      const response = await createReview(reviewData);
      toast.success('Review submitted successfully!');
      
      // Redirect to customer order history
      navigate('/my-orders');
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error(error.response?.data?.message || 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  const StarRating = ({ value, onChange, label }) => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div className="flex items-center space-x-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className={`p-1 rounded-full transition-colors ${
              star <= value ? 'text-yellow-400 hover:text-yellow-500' : 'text-gray-300 hover:text-gray-400'
            }`}
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462a1 1 0 00.951-.69l1.07-3.292a1 1 0 001.603-.921 1.902 0l-3.432 4.561a1 1 0 00-1.902 0l-3.432-4.561a1 1 0 00-1.603.921 1.902 0L9.049 2.927zM12 15a1 1 0 100 2 0 1 1 0 000-2z" />
            </svg>
          </button>
        ))}
        <span className="ml-2 text-sm text-gray-600">{value}/5</span>
      </div>
    </div>
  );

  if (!customerInfo) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-8 py-6">
            <h1 className="text-2xl font-bold text-white">Rate Your Experience</h1>
            <p className="text-blue-100 mt-2">Help us improve by sharing your feedback</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {/* Overall Rating */}
            <StarRating
              value={rating}
              onChange={setRating}
              label="Overall Rating"
            />

            {/* Detailed Ratings */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StarRating
                value={foodQuality}
                onChange={setFoodQuality}
                label="Food Quality"
              />
              <StarRating
                value={serviceQuality}
                onChange={setServiceQuality}
                label="Service Quality"
              />
              <StarRating
                value={ambiance}
                onChange={setAmbiance}
                label="Ambiance"
              />
            </div>

            {/* Comment */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Comments (Optional)
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                maxLength={500}
                className="w-full border border-gray-300 rounded-lg shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Share your experience with us..."
              />
              <p className="text-sm text-gray-500 mt-1">
                {comment.length}/500 characters
              </p>
            </div>

            {/* Would Recommend */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="wouldRecommend"
                checked={wouldRecommend}
                onChange={(e) => setWouldRecommend(e.target.checked)}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="wouldRecommend" className="ml-2 text-sm text-gray-700">
                I would recommend this restaurant to others
              </label>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate('/my-orders')}
                className="px-6 py-3 border border-gray-300 rounded-lg shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 border border-transparent rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                    Submitting...
                  </div>
                ) : (
                  'Submit Review'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CustomerReview;
