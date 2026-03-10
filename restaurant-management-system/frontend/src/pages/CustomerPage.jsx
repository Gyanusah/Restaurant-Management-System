import { useEffect, useState } from 'react';
import { getMenuItems, createOrder } from '../api/api';
import { useAuth } from '../utils/useAuth';

export const CustomerPage = () => {
    const { user } = useAuth();
    const [menuItems, setMenuItems] = useState([]);
    const [cart, setCart] = useState([]);
    const [tableNumber, setTableNumber] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchMenu = async () => {
            try {
                const response = await getMenuItems();
                setMenuItems(response.data);
            } catch (err) {
                setError('Failed to load menu');
            }
        };
        fetchMenu();
    }, []);

    const addToCart = (item) => {
        const existingItem = cart.find((cartItem) => cartItem.menuItemId === item._id);
        if (existingItem) {
            existingItem.quantity += 1;
            setCart([...cart]);
        } else {
            setCart([
                ...cart,
                {
                    menuItemId: item._id,
                    name: item.name,
                    price: item.price,
                    quantity: 1,
                },
            ]);
        }
    };

    const removeFromCart = (itemId) => {
        setCart(cart.filter((item) => item.menuItemId !== itemId));
    };

    const handlePlaceOrder = async (e) => {
        e.preventDefault();
        if (!tableNumber) {
            setError('Please enter table number');
            return;
        }
        if (cart.length === 0) {
            setError('Please select items');
            return;
        }

        setLoading(true);
        try {
            await createOrder({
                tableNumber: parseInt(tableNumber),
                items: cart,
            });
            alert('Order placed successfully!');
            setCart([]);
            setTableNumber('');
        } catch (err) {
            setError('Failed to place order');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="container mx-auto p-4">
                <h1 className="text-3xl font-bold mb-8">Welcome, {user?.name}</h1>

                <div className="grid grid-cols-3 gap-4">
                    {/* Menu Section */}
                    <div className="col-span-2">
                        <h2 className="text-2xl font-bold mb-4">Menu</h2>
                        <div className="grid grid-cols-2 gap-4">
                            {menuItems.map((item) => (
                                <div key={item._id} className="bg-white p-4 rounded-lg shadow">
                                    <h3 className="text-lg font-semibold">{item.name}</h3>
                                    <p className="text-gray-600 text-sm mb-2">{item.description}</p>
                                    <p className="text-2xl font-bold text-blue-600 mb-4">Rs. {item.price}</p>
                                    <button
                                        onClick={() => addToCart(item)}
                                        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                                    >
                                        Add to Cart
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Cart Section */}
                    <div className="col-span-1">
                        <div className="bg-white p-4 rounded-lg shadow">
                            <h2 className="text-2xl font-bold mb-4">Your Cart</h2>
                            {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}

                            <form onSubmit={handlePlaceOrder}>
                                <div className="mb-4">
                                    <label className="block text-gray-700 text-sm font-bold mb-2">Table Number</label>
                                    <input
                                        type="number"
                                        value={tableNumber}
                                        onChange={(e) => setTableNumber(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded"
                                        required
                                    />
                                </div>

                                <div className="mb-4 max-h-60 overflow-y-auto">
                                    {cart.length === 0 ? (
                                        <p className="text-gray-600">No items in cart</p>
                                    ) : (
                                        cart.map((item) => (
                                            <div key={item.menuItemId} className="flex justify-between items-center mb-2 pb-2 border-b">
                                                <div>
                                                    <p className="font-semibold">{item.name}</p>
                                                    <p className="text-sm text-gray-600">Rs. {item.price} x {item.quantity}</p>
                                                </div>
                                                <button
                                                    onClick={() => removeFromCart(item.menuItemId)}
                                                    className="text-red-600 hover:text-red-800 text-sm"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        ))
                                    )}
                                </div>

                                {cart.length > 0 && (
                                    <div className="mb-4">
                                        <p className="text-xl font-bold">
                                            Total: Rs. {cart.reduce((sum, item) => sum + item.price * item.quantity, 0)}
                                        </p>
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 disabled:opacity-50"
                                >
                                    {loading ? 'Placing...' : 'Place Order'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
