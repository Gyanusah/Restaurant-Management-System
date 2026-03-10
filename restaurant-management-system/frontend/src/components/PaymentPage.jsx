import { useState } from 'react';

export const PaymentPage = ({ order, paymentMethod, totalAmount, onSuccess, onCancel }) => {
    const [loading, setLoading] = useState(false);
    const [paymentStatus, setPaymentStatus] = useState('pending');

    // Generate QR code link (using third-party service)
    const generateQRCode = () => {
        const qrData = `ORDER_${order.id}_${totalAmount}`;
        return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrData)}`;
    };

    const handleCardPayment = async () => {
        setLoading(true);
        try {
            // Simulate payment processing
            await new Promise(resolve => setTimeout(resolve, 2000));
            setPaymentStatus('success');
            setTimeout(() => onSuccess(), 1500);
        } catch (error) {
            setPaymentStatus('failed');
        } finally {
            setLoading(false);
        }
    };

    const handleQRPayment = () => {
        // QR code payment instructions
        setLoading(true);
        // In real app, user would scan and complete payment
        // For demo, auto-success after timeout
        setTimeout(() => {
            setPaymentStatus('success');
            setTimeout(() => onSuccess(), 1500);
        }, 3000);
    };

    const generatePaymentLink = () => {
        return `https://payment.example.com/pay?order=${order.id}&amount=${totalAmount}&merchant=foodhub`;
    };

    // Success Screen
    if (paymentStatus === 'success') {
        return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl max-w-md w-full p-8 text-center">
                    <div className="text-6xl mb-4 animate-bounce">✅</div>
                    <h2 className="text-3xl font-bold text-gray-800 mb-2">Payment Successful!</h2>
                    <p className="text-gray-600 mb-6">Your order has been confirmed and sent to the kitchen</p>

                    <div className="bg-green-50 border-2 border-green-500 rounded-xl p-4 mb-6">
                        <p className="text-sm text-gray-600 mb-2">Order ID</p>
                        <p className="text-2xl font-bold text-green-600">#ORD{order.id}</p>
                    </div>

                    <div className="space-y-2 text-left bg-gray-50 p-4 rounded-lg mb-6">
                        <p className="text-gray-600"><strong>Amount:</strong> ${totalAmount}</p>
                        <p className="text-gray-600"><strong>Payment Method:</strong>
                            {paymentMethod === 'card' && ' Credit Card'}
                            {paymentMethod === 'qr' && ' QR Code'}
                            {paymentMethod === 'upi' && ' Digital Wallet'}
                            {paymentMethod === 'cash' && ' Cash'}
                        </p>
                        <p className="text-gray-600"><strong>Status:</strong> <span className="text-green-600 font-bold">✓ Completed</span></p>
                    </div>

                    <button
                        onClick={onSuccess}
                        className="w-full bg-green-500 text-white font-bold py-3 rounded-lg hover:bg-green-600 transition"
                    >
                        Continue to Order Tracking
                    </button>
                </div>
            </div>
        );
    }

    // Failed Screen
    if (paymentStatus === 'failed') {
        return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl max-w-md w-full p-8 text-center">
                    <div className="text-6xl mb-4">❌</div>
                    <h2 className="text-3xl font-bold text-gray-800 mb-2">Payment Failed!</h2>
                    <p className="text-gray-600 mb-6">Please try again or use another payment method</p>

                    <div className="space-y-3">
                        <button
                            onClick={() => setPaymentStatus('pending')}
                            className="w-full bg-blue-500 text-white font-bold py-3 rounded-lg hover:bg-blue-600 transition"
                        >
                            Try Again
                        </button>
                        <button
                            onClick={onCancel}
                            className="w-full border-2 border-gray-400 text-gray-800 font-bold py-3 rounded-lg hover:bg-gray-100 transition"
                        >
                            Cancel Order
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Main Payment Screen
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-screen overflow-y-auto">
                {/* Header */}
                <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-6">
                    <h2 className="text-3xl font-bold">Complete Payment</h2>
                    <p className="text-white/90">Total Amount: <span className="text-3xl font-bold">${totalAmount}</span></p>
                </div>

                {/* Content */}
                <div className="p-6">
                    {/* Card Payment */}
                    {paymentMethod === 'card' && (
                        <div className="space-y-6">
                            <div>
                                <label className="block text-gray-700 font-semibold mb-2">Card Number</label>
                                <input
                                    type="text"
                                    placeholder="1234 5678 9012 3456"
                                    maxLength="19"
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-gray-700 font-semibold mb-2">Expiry Date</label>
                                    <input
                                        type="text"
                                        placeholder="MM/YY"
                                        maxLength="5"
                                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-700 font-semibold mb-2">CVV</label>
                                    <input
                                        type="text"
                                        placeholder="123"
                                        maxLength="3"
                                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-gray-700 font-semibold mb-2">Cardholder Name</label>
                                <input
                                    type="text"
                                    placeholder="John Doe"
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none"
                                />
                            </div>
                        </div>
                    )}

                    {/* QR Code Payment */}
                    {paymentMethod === 'qr' && (
                        <div className="space-y-6 text-center">
                            <div className="bg-blue-50 border-2 border-blue-300 rounded-xl p-8">
                                <p className="text-gray-700 font-semibold mb-4">Scan this QR code to pay</p>
                                <div className="inline-block bg-white p-4 rounded-lg">
                                    <img
                                        src={generateQRCode()}
                                        alt="Payment QR Code"
                                        className="w-64 h-64"
                                    />
                                </div>
                                <p className="text-sm text-gray-600 mt-4">Use any QR code scanner to complete payment</p>
                            </div>

                            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 text-left">
                                <p className="text-sm text-gray-700">
                                    <strong>Once you scan and pay, come back to confirm payment completion</strong>
                                </p>
                            </div>
                        </div>
                    )}

                    {/* UPI/Digital Wallet Payment */}
                    {paymentMethod === 'upi' && (
                        <div className="space-y-6">
                            <div className="bg-green-50 border-2 border-green-300 rounded-xl p-6">
                                <p className="text-gray-700 font-semibold mb-4">Payment Link Generated</p>
                                <p className="text-sm text-gray-600 mb-4">Click the link below or copy it to complete payment:</p>

                                <div className="bg-white border-2 border-green-500 rounded-lg p-4 mb-4 break-all">
                                    <a href={generatePaymentLink()} className="text-green-600 font-semibold hover:underline">
                                        {generatePaymentLink()}
                                    </a>
                                </div>

                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(generatePaymentLink());
                                        alert('Link copied to clipboard!');
                                    }}
                                    className="w-full bg-green-500 text-white font-bold py-2 rounded-lg hover:bg-green-600 transition"
                                >
                                    Copy Link
                                </button>
                            </div>

                            <a
                                href={generatePaymentLink()}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full block text-center bg-green-600 text-white font-bold py-3 rounded-lg hover:bg-green-700 transition"
                            >
                                Pay Now
                            </a>
                        </div>
                    )}

                    {/* Cash Payment */}
                    {paymentMethod === 'cash' && (
                        <div className="space-y-6 text-center">
                            <div className="bg-blue-50 border-2 border-blue-300 rounded-xl p-8">
                                <div className="text-6xl mb-4">💵</div>
                                <h3 className="text-2xl font-bold text-gray-800 mb-2">Cash Payment</h3>
                                <p className="text-gray-600 mb-4">You will pay <span className="font-bold text-2xl text-blue-600">${totalAmount}</span> at the table</p>

                                <div className="bg-blue-100 border-l-4 border-blue-500 p-4 text-left">
                                    <p className="text-sm text-gray-700">
                                        <strong>Your order will be prepared and delivered to your table. Payment should be made upon delivery.</strong>
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="bg-gray-100 p-6 flex gap-4 sticky bottom-0">
                    <button
                        onClick={onCancel}
                        className="flex-1 border-2 border-gray-400 text-gray-800 font-bold py-3 rounded-lg hover:bg-gray-200 transition"
                    >
                        Cancel
                    </button>

                    {paymentMethod === 'cash' ? (
                        <button
                            onClick={onSuccess}
                            className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold py-3 rounded-lg hover:from-orange-600 hover:to-red-600 transition"
                        >
                            Proceed
                        </button>
                    ) : (
                        <button
                            onClick={paymentMethod === 'qr' ? handleQRPayment : handleCardPayment}
                            disabled={loading}
                            className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold py-3 rounded-lg hover:from-orange-600 hover:to-red-600 transition disabled:opacity-50"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <span className="animate-spin">⏳</span> Processing...
                                </span>
                            ) : (
                                'Complete Payment'
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
