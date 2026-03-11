import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const defaultMenuItems = [
  // Appetizers
  {
    _id: 'a1',
    name: 'brochette',
    description: 'Toasted bread topped with tomatoes, garlic, and fresh basil',
    price: 7.99,
    category: 'appetizer',
    image: '/images/brochette.jpg',
    isAvailable: true,
    isFeatured: true
  },
  {
    _id: 'a2',
    name: 'Mozzarella Sticks',
    description: 'Crispy breaded mozzarella with marinara sauce',
    price: 8.99,
    category: 'appetizer',
    image: '/images/mozzarella-sticks.jpg',
    isAvailable: true,
    isFeatured: false
  },
  {
    _id: 'a3',
    name: 'Chicken Wings',
    description: 'Crispy chicken wings with your choice of sauce',
    price: 10.99,
    category: 'appetizer',
    image: '/images/wings.jpg',
    isAvailable: true,
    isFeatured: true
  },

  // Main Courses
  {
    _id: 'm1',
    name: 'Margherita Pizza',
    description: 'Classic pizza with tomato sauce and mozzarella',
    price: 12.99,
    category: 'main',
    image: '/images/pizza.jpg',
    isAvailable: true,
    isFeatured: true
  },
  {
    _id: 'm2',
    name: 'Grilled Salmon',
    description: 'Fresh Atlantic salmon with lemon butter sauce and vegetables',
    price: 18.99,
    category: 'main',
    image: '/images/salmon.jpg',
    isAvailable: true,
    isFeatured: true
  },
  {
    _id: 'm3',
    name: 'Beef Burger',
    description: 'Juicy beef patty with cheese, lettuce, and special sauce',
    price: 14.99,
    category: 'main',
    image: '/images/burger.jpg',
    isAvailable: true,
    isFeatured: true
  },
  {
    _id: 'm4',
    name: 'Chicken Alfredo Pasta',
    description: 'Fettuccine pasta with creamy alfredo sauce and grilled chicken',
    price: 15.99,
    category: 'main',
    image: '/images/alfredo.jpg',
    isAvailable: true,
    isFeatured: false
  },

  // Desserts
  {
    _id: 'd1',
    name: 'Chocolate Brownie',
    description: 'Warm chocolate brownie with vanilla ice cream',
    price: 6.99,
    category: 'dessert',
    image: '/images/dessert.jpg',
    isAvailable: true,
    isFeatured: true
  },
  {
    _id: 'd2',
    name: 'New York Cheesecake',
    description: 'Classic cheesecake with strawberry topping',
    price: 7.99,
    category: 'dessert',
    image: '/images/cheesecake.jpg',
    isAvailable: true,
    isFeatured: true
  },

  // Drinks
  {
    _id: 'dr1',
    name: 'Iced Tea',
    description: 'Freshly brewed iced tea with lemon',
    price: 2.99,
    category: 'beverage',
    image: '/images/iced-tea.jpg',
    isAvailable: true,
    isFeatured: false
  },
  {
    _id: 'dr2',
    name: 'Fresh Lemonade',
    description: 'Homemade lemonade with fresh mint',
    price: 3.99,
    category: 'beverage',
    image: '/images/lemonade.jpg',
    isAvailable: true,
    isFeatured: true
  }
];

// Helper function to ensure image path is correct
const getImagePath = (path) => {
  if (!path) return 'https://placehold.co/400x300/orange/white?text=Food+Image';
  // If it's an absolute URL, return as is
  if (path.startsWith('http')) return path;
  // If it's a local path, ensure it has a leading slash
  if (!path.startsWith('/')) return `/${path}`;
  return path;
};

export const getMenuItems = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/menu`);
    // Ensure each item has a valid image path
    return response.data.map(item => ({
      ...item,
      image: getImagePath(item.image)
    }));
  } catch (error) {
    console.error('Error fetching menu items:', error);
    // Return default items with proper image paths
    return defaultMenuItems;
  }
};

export const getFeaturedItems = async () => {
  try {
    // Use the same implementation as getFeaturedMenuItems but without a limit
    const allItems = await getMenuItems();
    const featuredItems = allItems.filter(item => item.isFeatured === true);
    return featuredItems.length > 0 ? featuredItems : allItems.slice(0, 4);
  } catch (error) {
    console.error('Error in getFeaturedItems:', error);
    return [];
  }
};

export const getFeaturedMenuItems = async (limit = 4) => {
  try {
    // First try to get all menu items
    const allItems = await getMenuItems();

    // Get all featured items that are available
    const featuredItems = allItems.filter(item => item.isFeatured && item.isAvailable);

    // If we have enough featured items, return them
    if (featuredItems.length >= limit) {
      return featuredItems.slice(0, limit);
    }

    // If not enough featured items, fill the rest with other available items
    if (featuredItems.length > 0) {
      const nonFeaturedItems = allItems.filter(
        item => !item.isFeatured && item.isAvailable && !featuredItems.some(fi => fi._id === item._id)
      );
      return [...featuredItems, ...nonFeaturedItems].slice(0, limit);
    }

    // If no featured items, return available items
    return allItems.filter(item => item.isAvailable).slice(0, limit);

  } catch (error) {
    console.error('Error in getFeaturedMenuItems:', error);
    // Return default items that are marked as featured
    return defaultMenuItems.filter(item => item.isFeatured).slice(0, limit);
  }
};

// Cache for categories
let categoriesCache = null;
let categoriesPromise = null; // Cache the promise to prevent duplicate requests

// Helper to get default categories
const getDefaultCategories = () => {
  const defaultCategories = [...new Set(defaultMenuItems.map(item => item.category))];
  return defaultCategories.length > 0
    ? defaultCategories
    : ['All', 'Appetizers', 'Main Course', 'Desserts', 'Drinks'];
};

// Function to clear the cache (useful for testing or force refresh)
export const clearCategoriesCache = () => {
  categoriesCache = null;
  categoriesPromise = null;
};

export const getCategories = async () => {
  // If we already have the data, return it
  if (categoriesCache) {
    return categoriesCache;
  }

  // If we already have a request in progress, return that promise
  if (categoriesPromise) {
    return categoriesPromise;
  }

  // Create a new request
  categoriesPromise = (async () => {
    try {
      const response = await axios.get(`${API_URL}/api/menu/categories`, {
        timeout: 3000, // Shorter timeout for faster fallback
        validateStatus: status => status === 200
      });

      if (response.data?.categories && Array.isArray(response.data.categories)) {
        categoriesCache = response.data.categories;
        return categoriesCache;
      }

      throw new Error('Invalid response format');

    } catch (error) {
      console.warn('Using default categories due to:', error.message);
      return getDefaultCategories();
    } finally {
      // Clear the promise so we can retry later if needed
      categoriesPromise = null;
    }
  })();

  return categoriesPromise;
};

export const createOrder = async (orderData) => {
  try {
    const response = await axios.post(`${API_URL}/api/orders`, orderData);
    return response.data;
  } catch (error) {
    console.error('Error creating order:', error);
    // Simulate a successful order response if the API fails
    return {
      success: true,
      order: {
        _id: 'simulated_' + Date.now(),
        ...orderData,
        status: 'received',
        orderNumber: Math.floor(1000 + Math.random() * 9000)
      },
      message: 'Order received (simulated)'
    };
  }
};