import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const MenuCard = ({ item, onAddToCart }) => {
    const navigate = useNavigate();
    
    const handleCardClick = (e) => {
        // Don't navigate if clicking on a button or input
        if (e.target.tagName === 'BUTTON' || e.target.tagName === 'INPUT') {
            return;
        }
        navigate(`/menu/item/${item._id}`);
    };
    const [quantity, setQuantity] = useState(1);
    const [showQuantity, setShowQuantity] = useState(false);

    const handleAdd = () => {
        onAddToCart(item, quantity);
    };

    const handleIncrement = () => {
        setQuantity(q => q + 1);
    };

    const handleDecrement = () => {
        if (quantity > 1) {
            setQuantity(q => q - 1);
        }
    };

    return (
        <div 
            className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer"
            onClick={handleCardClick}
        >
            {/* Image Section */}
            <div className="relative bg-gray-100 h-48 flex items-center justify-center overflow-hidden">
                {item.image ? (
                    <img 
                        src={item.image.startsWith('http') || item.image.startsWith('/') ? item.image : `/${item.image}`} 
                        alt={item.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                            e.target.onerror = null; // Prevent infinite loop
                            e.target.src = '/images/food-placeholder.jpg';
                            // If placeholder also fails, show emoji as fallback
                            e.target.onerror = () => {
                                e.target.style.display = 'none';
                                e.target.parentElement.innerHTML = '<div class="text-7xl text-gray-300">🍽️</div>';
                            };
                        }}
                    />
                ) : (
                    <div className="text-7xl text-gray-300">🍽️</div>
                )}
                {/* Category Badge */}
                <div className="absolute top-3 right-3 bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full">
                    {item.category || 'Main'}
                </div>
            </div>

            {/* Content Section */}
            <div className="p-5">
                {/* Name and Price */}
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-bold text-gray-800 line-clamp-2">{item.name}</h3>
                    <span className="text-lg font-bold text-blue-600">${item.price}</span>
                </div>

                {/* Description */}
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {item.description || 'Delicious food item'}
                </p>

                {/* Rating */}
                <div className="flex items-center gap-2 mb-4">
                    <span className="text-yellow-500">⭐</span>
                    <span className="text-sm font-semibold text-gray-700">
                        {item.rating || 4.5} ({item.reviews || 120})
                    </span>
                </div>

                {/* Price and Action */}
                <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                        <span className="text-2xl font-bold text-orange-600">${item.price}</span>
                        {item.originalPrice && (
                            <span className="text-sm line-through text-gray-400">
                                ${item.originalPrice}
                            </span>
                        )}
                    </div>

                    {!showQuantity ? (
                        <button
                            onClick={() => setShowQuantity(true)}
                            className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-lg hover:from-orange-600 hover:to-red-600 transition-all transform hover:scale-105 font-semibold"
                        >
                            Add to Cart
                        </button>
                    ) : (
                        <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                            <button
                                onClick={handleDecrement}
                                className="bg-white w-8 h-8 rounded flex items-center justify-center hover:bg-gray-200 transition"
                            >
                                −
                            </button>
                            <span className="w-8 text-center font-bold text-gray-800">{quantity}</span>
                            <button
                                onClick={handleIncrement}
                                className="bg-white w-8 h-8 rounded flex items-center justify-center hover:bg-gray-200 transition"
                            >
                                +
                            </button>
                            <button
                                onClick={handleAdd}
                                className="bg-green-500 text-white px-3 py-1 rounded text-sm font-bold hover:bg-green-600 transition ml-1"
                            >
                                ✓
                            </button>
                        </div>
                    )}
                </div>

                {/* Discount Badge */}
                {item.discount && (
                    <div className="mt-3 bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded text-center">
                        {item.discount}% OFF
                    </div>
                )}
            </div>
        </div>
    );
};

export default MenuCard;
