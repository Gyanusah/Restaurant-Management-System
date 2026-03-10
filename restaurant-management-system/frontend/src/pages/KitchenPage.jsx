import { useEffect, useState } from 'react';
import { getKitchenOrders, updateOrderStatus } from '../services/orderService';

export const KitchenPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchOrders();
        const interval = setInterval(fetchOrders, 5000); // Refresh every 5 seconds
        return () => clearInterval(interval);
    }, []);

    const fetchOrders = async () => {
        try {
            const data = await getKitchenOrders();
            setOrders(data || []);
        } catch (err) {
            setError('Failed to load orders');
            console.error('Error fetching kitchen orders:', err);
        }
    };

    const handleStatusChange = async (orderId, newStatus) => {
        setLoading(true);
        try {
            await updateOrderStatus(orderId, { status: newStatus });
            await fetchOrders();
        } catch (err) {
            setError('Failed to update order status');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="container mx-auto p-4">
                <h1 className="text-3xl font-bold mb-8">Kitchen Dashboard</h1>

                {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {orders.length === 0 ? (
                        <div className="col-span-full text-center text-gray-600 py-8">No active orders</div>
                    ) : (
                        orders.map((order) => (
                            <div key={order._id} className="bg-white p-4 rounded-lg shadow">
                                <div className="mb-2">
                                    <p className="text-sm font-semibold text-gray-600">Order ID: {order._id.slice(-6)}</p>
                                    <p className="text-lg font-bold">Table {order.tableNumber}</p>
                                    <p className="text-sm text-gray-500">Status: {order.status.toUpperCase()}</p>
                                </div>

                                <div className="mb-4 border-t pt-2">
                                    <h3 className="font-semibold mb-2">Items:</h3>
                                    {order.items.map((item, idx) => (
                                        <p key={idx} className="text-sm text-gray-700">
                                            {item.quantity}x {item.name}
                                        </p>
                                    ))}
                                </div>

                                {order.specialInstructions && (
                                    <div className="mb-4 p-2 bg-yellow-50 rounded">
                                        <p className="text-sm font-semibold">Notes: {order.specialInstructions}</p>
                                    </div>
                                )}

                                <div className="flex gap-2">
                                    {order.status === 'pending' && (
                                        <button
                                            onClick={() => handleStatusChange(order._id, 'preparing')}
                                            disabled={loading}
                                            className="flex-1 bg-yellow-600 text-white py-2 rounded hover:bg-yellow-700 disabled:opacity-50"
                                        >
                                            Start Preparing
                                        </button>
                                    )}
                                    {order.status === 'preparing' && (
                                        <button
                                            onClick={() => handleStatusChange(order._id, 'ready')}
                                            disabled={loading}
                                            className="flex-1 bg-green-600 text-white py-2 rounded hover:bg-green-700 disabled:opacity-50"
                                        >
                                            Mark Ready
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};
