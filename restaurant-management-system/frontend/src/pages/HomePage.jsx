import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { getCategories, getFeaturedMenuItems, getMenuItems, getFavoriteMenuItems } from "../api/api";

const HomePage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [categories, setCategories] = useState([]);
  const [featuredItems, setFeaturedItems] = useState([]);
  const [favoriteItems, setFavoriteItems] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [customerInfo, setCustomerInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  const tableParam = searchParams.get("table");

  useEffect(() => {
    const storedCustomer = localStorage.getItem("customerInfo");
    if (storedCustomer) {
      setCustomerInfo(JSON.parse(storedCustomer));
    }
    if (tableParam) {
      localStorage.setItem("currentTable", tableParam);
    }
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [categoriesData, featuredData, favoriteData, menuData] = await Promise.all([
        getCategories(),
        getFeaturedMenuItems(),
        getFavoriteMenuItems(),
        getMenuItems()
      ]);
      setCategories(categoriesData || []);
      setFeaturedItems(featuredData || []);
      setFavoriteItems(favoriteData || []);
      setMenuItems(Array.isArray(menuData) ? menuData : []);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGetStarted = () => {
    if (customerInfo) {
      if (tableParam) {
        navigate(`/menu?table=${tableParam}`);
      } else {
        navigate("/scan");
      }
    } else {
      if (tableParam) {
        navigate(`/customer-login?table=${tableParam}`);
      } else {
        navigate("/customer-login");
      }
    }
  };

  // Helper function to get items by category
  const getItemsByCategory = (categoryName) => {
    return menuItems.filter(item => 
      item.category === categoryName || 
      (item.category && item.category.name === categoryName)
    );
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* NAVBAR */}
      <header className="bg-white/95 backdrop-blur-sm shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">FQ</span>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              FoodieQR
            </h1>
          </div>
          <button
            onClick={handleGetStarted}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            {customerInfo ? "View Menu" : "Order Now"}
          </button>
        </div>
      </header>

      {/* HERO SECTION WITH IMAGE */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/90 via-indigo-900/80 to-purple-900/70"></div>
          <img
            src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
            alt="Restaurant dining"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 text-center text-white">
          <div className="max-w-4xl mx-auto">
            {/* Attention Badge */}
            {/* <div className="inline-flex items-center bg-yellow-400/20 backdrop-blur-sm border border-yellow-400/30 rounded-full px-4 py-2 mb-6">
              <span className="text-yellow-300 text-sm font-medium">🔥 New: AI-Powered Recommendations</span>
            </div> */}

            {/* Main Headline */}
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              <span className="block">Order Instantly,</span>
              <span className="block bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                Dine Delightfully
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto leading-relaxed">
              Skip the wait, scan & savor! Your favorite dishes delivered to your table in minutes, not hours.
            </p>

            {/* Stats */}
            <div className="flex justify-center gap-8 mb-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-400">50K+</div>
                <div className="text-sm text-blue-200">Happy Customers</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-400">4.9★</div>
                <div className="text-sm text-blue-200">Customer Rating</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-400">5min</div>
                <div className="text-sm text-blue-200">Avg. Delivery</div>
              </div>
            </div>

            {/* QR Detection Alert */}
            {tableParam && (
              <div className="bg-green-500/20 backdrop-blur-sm border border-green-400/30 text-green-100 px-6 py-3 rounded-lg inline-block mb-6">
                <div className="flex items-center justify-center space-x-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">Table {tableParam} detected - Ready to order!</span>
                </div>
              </div>
            )}

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button
                onClick={handleGetStarted}
                className="bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 px-8 py-4 rounded-lg font-bold text-lg hover:from-yellow-500 hover:to-orange-500 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105"
              >
                {customerInfo ? "🍽️ View Menu" : "🚀 Start Ordering"}
              </button>
              <button
                onClick={() => navigate("/scan")}
                className="border-2 border-white/30 backdrop-blur-sm text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white/20 transition-all duration-300"
              >
                📱 Scan QR Code
              </button>
            </div>

            {/* Trust Indicators */}
            <div className="mt-12 flex justify-center items-center space-x-8 text-blue-200">
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm">Secure Payments</span>
              </div>
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6z" />
                </svg>
                <span className="text-sm">Real-time Updates</span>
              </div>
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm">Quality Guaranteed</span>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-yellow-400/20 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-blue-400/20 rounded-full blur-xl animate-pulse delay-1000"></div>
      </section>

      {/* CATEGORY SECTION WITH ITEMS */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">
              Explore Our <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Menu Categories</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              From appetizers to desserts, we've got everything your cravings desire
            </p>
          </div>

          {categories.map((category) => {
            const categoryItems = getItemsByCategory(category.name);
            if (categoryItems.length === 0) return null;
            
            return (
              <div key={category._id} className="mb-16">
                {/* Category Header */}
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center text-3xl">
                      {category.name === 'Appetizers' && '🥗'}
                      {category.name === 'Main Course' && '🍽️'}
                      {category.name === 'Desserts' && '🍰'}
                      {category.name === 'Beverages' && '🥤'}
                      {category.name === 'Starters' && '🍟'}
                      {category.name === 'Soups' && '🍲'}
                      {category.name === 'Salads' && '🥬'}
                      {category.name === 'Rice' && '🍚'}
                      {category.name === 'Breads' && '🍞'}
                      {category.name === 'Chinese' && '🥡'}
                      {category.name === 'Italian' && '🍕'}
                      {category.name === 'Indian' && '🍛'}
                      {!category.name && '🍽️'}
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">{category.name}</h3>
                      <p className="text-gray-600">{categoryItems.length} items available</p>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate(`/menu?category=${category._id}${tableParam ? `&table=${tableParam}` : ''}`)}
                    className="text-blue-600 hover:text-blue-700 font-semibold flex items-center space-x-2 transition-colors"
                  >
                    <span>View All</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>

                {/* Category Items Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {categoryItems.slice(0, 4).map((item) => (
                    <div
                      key={item._id}
                      className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:scale-105"
                    >
                      <div className="h-48 bg-gray-200 relative overflow-hidden">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full bg-gradient-to-br from-gray-100 to-gray-200">
                            <span className="text-4xl">🍽️</span>
                          </div>
                        )}
                        {item.isAvailable && (
                          <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                            Available
                          </div>
                        )}
                        {item.isFeatured && (
                          <div className="absolute top-2 right-2 bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                            Popular
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <h4 className="font-semibold text-lg mb-2">{item.name}</h4>
                        <p className="text-gray-600 text-sm line-clamp-2 mb-3">{item.description}</p>
                        <div className="flex justify-between items-center">
                          <span className="text-xl font-bold text-blue-600">₹{item.price}</span>
                          <button
                            onClick={() => navigate(`/menu?table=${tableParam}`)}
                            className="bg-blue-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-blue-700 transition-colors"
                          >
                            Order
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Show More Button if more than 4 items */}
                {categoryItems.length > 4 && (
                  <div className="text-center mt-6">
                    <button
                      onClick={() => navigate(`/menu?category=${category._id}${tableParam ? `&table=${tableParam}` : ''}`)}
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300"
                    >
                      View {categoryItems.length - 4} more items in {category.name}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* FEATURED ITEMS */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">
              Customer <span className="bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">Favorites</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Hand-picked dishes that our customers can't get enough of
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {favoriteItems.slice(0, 4).map((item) => (
              <div
                key={item._id}
                className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:scale-105"
              >
                <div className="h-48 bg-gray-200 relative overflow-hidden">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full bg-gradient-to-br from-gray-100 to-gray-200">
                      <span className="text-4xl">🍽️</span>
                    </div>
                  )}
                  <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                    FAVORITE
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-semibold text-lg mb-2">{item.name}</h3>
                  <p className="text-gray-600 text-sm line-clamp-2 mb-4">{item.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                      ₹{item.price}
                    </span>
                    <button
                      onClick={() => navigate(`/menu?table=${tableParam}`)}
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:from-blue-700 hover:to-indigo-700 transition-all duration-300"
                    >
                      Order Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">
            How <span className="bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">FoodieQR</span> Works
          </h2>
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
            Three simple steps to delicious food delivered to your table
          </p>

          <div className="grid md:grid-cols-3 gap-10">
            <div className="group">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <span className="text-3xl">📱</span>
              </div>
              <h3 className="font-semibold text-xl mb-2">Scan QR Code</h3>
              <p className="text-gray-600">Simply scan the QR code on your table to instantly access our digital menu</p>
            </div>

            <div className="group">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <span className="text-3xl">🍔</span>
              </div>
              <h3 className="font-semibold text-xl mb-2">Browse & Order</h3>
              <p className="text-gray-600">Explore our menu, customize your order, and pay securely - all from your phone</p>
            </div>

            <div className="group">
              <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <span className="text-3xl">🎉</span>
              </div>
              <h3 className="font-semibold text-xl mb-2">Enjoy & Track</h3>
              <p className="text-gray-600">Track your order in real-time and enjoy your freshly prepared meal at your table</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white py-20 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10 max-w-4xl mx-auto px-4">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Experience the Future of Dining?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Join thousands of satisfied customers who've made their dining experience seamless and delightful
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button
              onClick={handleGetStarted}
              className="bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 px-8 py-4 rounded-lg font-bold text-lg hover:from-yellow-500 hover:to-orange-500 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105"
            >
              Start Ordering Now
            </button>
            <button
              onClick={() => navigate("/scan")}
              className="border-2 border-white/30 backdrop-blur-sm text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white/20 transition-all duration-300"
            >
              Learn More
            </button>
          </div>
        </div>
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-10 left-10 w-20 h-20 bg-yellow-400/10 rounded-full blur-xl"></div>
          <div className="absolute bottom-10 right-10 w-32 h-32 bg-blue-400/10 rounded-full blur-xl"></div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
