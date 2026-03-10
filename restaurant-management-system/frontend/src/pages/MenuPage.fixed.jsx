import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { getMenuItems, getCategories } from '../services/menuService';
import { useCart } from '../contexts/CartContext';

const MenuPage = () => {
  // Hooks and state
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addToCart, cart, removeFromCart } = useCart();

  // Component state
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tableNumber, setTableNumber] = useState('');

  // Fetch menu data and handle table selection
  useEffect(() => {
    const initializePage = async () => {
      // Check for table number first
      const tableFromUrl = searchParams.get('table') || localStorage.getItem('currentTable');
      if (!tableFromUrl) {
        toast.error('No table selected. Redirecting to table selection...');
        navigate('/scan');
        return;
      }
      
      setTableNumber(tableFromUrl);
      localStorage.setItem('currentTable', tableFromUrl);
      
      // Then fetch data
      try {
        setLoading(true);
        
        // Fetch menu items and categories in parallel
        const [itemsResponse, categoriesResponse] = await Promise.all([
          getMenuItems(),
          getCategories()
        ]);
        
        // Handle menu items
        const items = Array.isArray(itemsResponse?.data) 
          ? itemsResponse.data 
          : (Array.isArray(itemsResponse) ? itemsResponse : []);
        
        setMenuItems(items);
        
        // Handle categories
        const categoriesData = Array.isArray(categoriesResponse?.data)
          ? categoriesResponse.data
          : (Array.isArray(categoriesResponse) ? categoriesResponse : []);
          
        setCategories(categoriesData);
        
      } catch (error) {
        console.error('Error initializing page:', error);
        toast.error('Failed to load menu. Some features may be limited.');
      } finally {
        setLoading(false);
      }
    };
    
    initializePage();
  }, [navigate, searchParams]);

  // Filter items based on selected category
  const filteredItems = selectedCategory === 'all' 
    ? menuItems 
    : menuItems.filter(item => item.category === selectedCategory);

  // Handle adding items to cart
  const handleAddToCart = (item) => {
    addToCart({
      ...item,
      specialInstructions: '',
      quantity: 1
    });
  };

  // Handle removing items from cart
  const handleRemoveFromCart = (itemId) => {
    removeFromCart(itemId);
  };

  // Calculate cart total
  const cartTotal = cart.reduce((total, item) => {
    return total + (item.price * (item.quantity || 1));
  }, 0);

  // Handle checkout
  const handleCheckout = () => {
    if (cart.length === 0) {
      toast.error('Your cart is empty');
      return;
    }
    setIsCheckingOut(true);
  };

  // Handle placing order
  const handlePlaceOrder = async () => {
    try {
      // Here you would typically make an API call to place the order
      // await placeOrder({ items: cart, tableNumber });
      toast.success('Order placed successfully!');
      setIsCheckingOut(false);
      // Optionally clear the cart after successful order
      // clearCart();
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error('Failed to place order. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl font-semibold">Loading menu...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Our Menu</h1>
      
      {/* Category Filter */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Categories</h2>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-full ${
              selectedCategory === 'all' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            All Items
          </button>
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full ${
                selectedCategory === category
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Menu Items */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-24">
        {filteredItems.map(item => (
          <div key={item._id} className="border rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
            <div className="h-48 bg-gray-200 overflow-hidden">
              <img 
                src={item.image || '/images/food-placeholder.jpg'} 
                alt={item.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/images/food-placeholder.jpg';
                }}
              />
            </div>
            <div className="p-4">
              <h3 className="text-xl font-semibold mb-2">{item.name}</h3>
              <p className="text-gray-600 mb-3">{item.description}</p>
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold">${item.price.toFixed(2)}</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleRemoveFromCart(item._id)}
                    className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                  >
                    -
                  </button>
                  <span className="w-6 text-center">
                    {cart.find(cartItem => cartItem._id === item._id)?.quantity || 0}
                  </span>
                  <button
                    onClick={() => handleAddToCart(item)}
                    className="w-8 h-8 rounded-full bg-blue-600 text-white hover:bg-blue-700 flex items-center justify-center"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Cart Summary */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          <div>
            <span className="font-semibold">Items in Cart: {cart.length}</span>
            <span className="ml-4">Total: ${cartTotal.toFixed(2)}</span>
          </div>
          <button
            onClick={handleCheckout}
            className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={cart.length === 0}
          >
            Checkout
          </button>
        </div>
      </div>

      {/* Checkout Modal */}
      {isCheckingOut && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Confirm Order</h2>
            <div className="mb-6 max-h-96 overflow-y-auto">
              {cart.length === 0 ? (
                <p className="text-gray-600">Your cart is empty</p>
              ) : (
                <>
                  {cart.map(item => (
                    <div key={item._id} className="flex justify-between items-center py-2 border-b">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-gray-600">Qty: {item.quantity || 1}</p>
                      </div>
                      <div className="flex items-center">
                        <span className="mr-4">${(item.price * (item.quantity || 1)).toFixed(2)}</span>
                        <button
                          onClick={() => handleRemoveFromCart(item._id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-lg font-semibold">
                      Total: ${cartTotal.toFixed(2)}
                    </p>
                  </div>
                </>
              )}
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setIsCheckingOut(false)}
                className="px-4 py-2 border rounded hover:bg-gray-100"
              >
                {cart.length === 0 ? 'Close' : 'Continue Shopping'}
              </button>
              {cart.length > 0 && (
                <button
                  onClick={handlePlaceOrder}
                  className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
                >
                  Place Order
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuPage;
