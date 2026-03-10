import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getMenuItems } from '../services/menuService';
import { toast } from 'react-hot-toast';

const MenuItemDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        setLoading(true);
        const items = await getMenuItems();
        const foundItem = items.find(i => i._id === id);
        
        if (foundItem) {
          setItem(foundItem);
        } else {
          toast.error('Menu item not found');
          navigate('/menu');
        }
      } catch (error) {
        console.error('Error fetching menu item:', error);
        toast.error('Failed to load menu item');
        navigate('/menu');
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [id, navigate]);

  const handleAddToCart = () => {
    // Add to cart logic here
    toast.success(`${quantity} ${item.name} added to cart`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-700">Item not found</h2>
        <button 
          onClick={() => navigate('/menu')} 
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Back to Menu
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <button 
        onClick={() => navigate(-1)}
        className="mb-6 flex items-center text-blue-500 hover:text-blue-700"
      >
        <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to Menu
      </button>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden md:flex">
        <div className="md:w-1/2">
          {item.image ? (
            <img 
              src={item.image.startsWith('http') ? item.image : `${import.meta.env.BASE_URL || ''}${item.image}`}
              alt={item.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = `${import.meta.env.BASE_URL || ''}/images/food-placeholder.jpg`;
              }}
            />
          ) : (
            <div className="h-full flex items-center justify-center bg-gray-100">
              <div className="text-9xl text-gray-300">🍽️</div>
            </div>
          )}
        </div>
        
        <div className="p-8 md:w-1/2">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{item.name}</h1>
              <p className="mt-2 text-gray-600">{item.category}</p>
            </div>
            <span className="text-3xl font-bold text-blue-600">${item.price.toFixed(2)}</span>
          </div>

          <p className="mt-6 text-gray-700">{item.description}</p>
          
          <div className="mt-8">
            <div className="flex items-center mb-6">
              <button 
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-xl font-bold hover:bg-gray-300"
              >
                -
              </button>
              <span className="mx-4 text-xl font-medium">{quantity}</span>
              <button 
                onClick={() => setQuantity(quantity + 1)}
                className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-xl font-bold hover:bg-gray-300"
              >
                +
              </button>
            </div>

            <button
              onClick={handleAddToCart}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Add to Cart - ${(item.price * quantity).toFixed(2)}
            </button>
          </div>

          {item.nutrition && (
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-semibold mb-3">Nutrition Information</h3>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(item.nutrition).map(([key, value]) => (
                  <div key={key} className="flex justify-between">
                    <span className="text-gray-600">{key}:</span>
                    <span className="font-medium">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MenuItemDetail;
