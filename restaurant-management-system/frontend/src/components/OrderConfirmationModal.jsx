import { useState } from 'react';

export const OrderConfirmationModal = ({ order, items, onConfirm, onCancel, onSelectPayment }) => {
    const [paymentMethod, setPaymentMethod] = useState('');
    const [userDetails, setUserDetails] = useState({
        tableNumber: '',
        specialInstructions: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUserDetails(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const calculateTotal = () => {
        return items.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2);
    };

    const handleConfirm = () => {
        if (!paymentMethod) {
            alert('Please select a payment method');
            return;
        }
        if (!userDetails.tableNumber) {
            alert('Please enter table number');
            return;
        }
        onConfirm({
            ...userDetails,
            paymentMethod,
            items,
            totalAmount: calculateTotal()
        });
    };

    const total = calculateTotal();

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-screen overflow-y-auto shadow-2xl">
                {/* Header */}
                <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-6 sticky top-0">
                    <h2 className="text-3xl font-bold">Order Confirmation</h2>
                    <p className="text-white/90">Review and confirm your order</p>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Order Items */}
                    <div>
                        <h3 className="text-xl font-bold text-gray-800 mb-4">Order Items</h3>
                        <div className="space-y-3 bg-gray-50 rounded-xl p-4">
                            {items.map((item, idx) => (
                                <div key={idx} className="flex justify-between items-center pb-3 border-b border-gray-200">
                                    <div className="flex-1">
                                        <p className="font-semibold text-gray-800">{item.name}</p>
                                        <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-orange-600">${(item.price * item.quantity).toFixed(2)}</p>
                                        <p className="text-xs text-gray-500">${item.price} each</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Table Number */}
                    <div>
                        <label className="block text-gray-700 font-semibold mb-2">Table Number</label>
                        <input
                            type="number"
                            name="tableNumber"
                            value={userDetails.tableNumber}
                            onChange={handleChange}
                            placeholder="Enter table number"
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none"
                            required
                        />
                    </div>

                    {/* Special Instructions */}
                    <div>
                        <label className="block text-gray-700 font-semibold mb-2">Special Instructions (Optional)</label>
                        <textarea
                            name="specialInstructions"
                            value={userDetails.specialInstructions}
                            onChange={handleChange}
                            placeholder="Any special requests? (e.g., No onions, Extra spicy, etc.)"
                            rows="3"
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none"
                        />
                    </div>

                    {/* Payment Method Selection */}
                    <div>
                        <h3 className="text-lg font-bold text-gray-800 mb-4">Select Payment Method</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Card Payment */}
                            <label className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition ${paymentMethod === 'card' ? 'border-orange-500 bg-orange-50' : 'border-gray-300 hover:border-orange-300'
                                }`}>
                                <input
                                    type="radio"
                                    name="paymentMethod"
                                    value="card"
                                    checked={paymentMethod === 'card'}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                    className="w-4 h-4"
                                />
                                <div className="ml-3 flex-1">
                                    <p className="font-semibold text-gray-800">💳 Credit/Debit Card</p>
                                    <p className="text-sm text-gray-600">Visa, Mastercard, Amex</p>
                                </div>
                            </label>

                            {/* QR Code Payment */}
                            <label className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition ${paymentMethod === 'qr' ? 'border-orange-500 bg-orange-50' : 'border-gray-300 hover:border-orange-300'
                                }`}>
                                <input
                                    type="radio"
                                    name="paymentMethod"
                                    value="qr"
                                    checked={paymentMethod === 'qr'}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                    className="w-4 h-4"
                                />
                                <div className="ml-3 flex-1">
                                    <p className="font-semibold text-gray-800">📱 QR Code</p>
                                    <p className="text-sm text-gray-600">Scan to pay instantly</p>
                                </div>
                            </label>

                            {/* UPI Payment */}
                            <label className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition ${paymentMethod === 'upi' ? 'border-orange-500 bg-orange-50' : 'border-gray-300 hover:border-orange-300'
                                }`}>
                                <input
                                    type="radio"
                                    name="paymentMethod"
                                    value="upi"
                                    checked={paymentMethod === 'upi'}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                    className="w-4 h-4"
                                />
                                <div className="ml-3 flex-1">
                                    <p className="font-semibold text-gray-800">💰 Digital Wallet</p>
                                    <p className="text-sm text-gray-600">Google Pay, PayPal, etc.</p>
                                </div>
                            </label>

                            {/* Cash Payment */}
                            <label className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition ${paymentMethod === 'cash' ? 'border-orange-500 bg-orange-50' : 'border-gray-300 hover:border-orange-300'
                                }`}>
                                <input
                                    type="radio"
                                    name="paymentMethod"
                                    value="cash"
                                    checked={paymentMethod === 'cash'}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                    className="w-4 h-4"
                                />
                                <div className="ml-3 flex-1">
                                    <p className="font-semibold text-gray-800">💵 Cash</p>
                                    <p className="text-sm text-gray-600">Pay at table</p>
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* Price Summary */}
                    <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                        <div className="flex justify-between text-gray-700">
                            <span>Subtotal:</span>
                            <span>${total}</span>
                        </div>
                        <div className="flex justify-between text-gray-700">
                            <span>Delivery Fee:</span>
                            <span>$2.00</span>
                        </div>
                        <div className="flex justify-between text-gray-700">
                            <span>Tax (5%):</span>
                            <span>${(total * 0.1).toFixed(2)}</span>
                        </div>
                        <div className="border-t-2 border-gray-300 pt-2 flex justify-between text-xl font-bold text-orange-600">
                            <span>Total:</span>
                            <span>${(parseFloat(total) + 2 + (parseFloat(total) * 0.1)).toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-gray-100 p-6 flex gap-4 sticky bottom-0">
                    <button
                        onClick={onCancel}
                        className="flex-1 px-6 py-3 border-2 border-gray-400 text-gray-800 font-bold rounded-lg hover:bg-gray-200 transition"
                    >
                        Cancel Order
                    </button>
                    <button
                        onClick={handleConfirm}
                        className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-lg hover:from-orange-600 hover:to-red-600 transition"
                    >
                        Confirm & Pay
                    </button>
                </div>
            </div>
        </div>
    );
};
