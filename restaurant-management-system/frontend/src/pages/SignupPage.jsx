import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signup } from '../api/api';
import { useAuth } from '../utils/useAuth';

export const SignupPage = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'customer',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const roles = [
        { value: 'customer', label: 'Customer', icon: '🍽️', description: 'Order delicious food' },
        { value: 'kitchen', label: 'Kitchen Staff', icon: '👨‍🍳', description: 'Prepare and manage orders' },
        { value: 'admin', label: 'Admin', icon: '⚙️', description: 'Manage restaurant' },
    ];

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await signup(formData);
            login(response.data.user, response.data.token);
            navigate(response.data.user.role === 'admin' ? '/admin' : response.data.user.role === 'kitchen' ? '/kitchen' : '/customer');
        } catch (err) {
            setError(err.response?.data?.message || 'Signup failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center py-12 px-4">
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="text-5xl mb-4">🚀</div>
                    <h1 className="text-4xl font-bold text-gray-800 mb-2">FoodHub</h1>
                    <p className="text-gray-600">Join our restaurant community</p>
                </div>

                {/* Form Container */}
                <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10">
                    {error && (
                        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded mb-6">
                            <p className="font-bold">Error</p>
                            <p>{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Name Field */}
                        <div>
                            <label className="block text-gray-700 text-sm font-semibold mb-2">Full Name</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="John Doe"
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none transition"
                                required
                            />
                        </div>

                        {/* Email Field */}
                        <div>
                            <label className="block text-gray-700 text-sm font-semibold mb-2">Email Address</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="you@example.com"
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none transition"
                                required
                            />
                        </div>

                        {/* Password Field */}
                        <div>
                            <label className="block text-gray-700 text-sm font-semibold mb-2">Password</label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="••••••••"
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none transition"
                                required
                            />
                        </div>

                        {/* Role Selection */}
                        <div>
                            <label className="block text-gray-700 text-sm font-semibold mb-3">Select Your Role</label>
                            <div className="grid grid-cols-1 gap-3">
                                {roles.map((r) => (
                                    <label
                                        key={r.value}
                                        className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition ${formData.role === r.value
                                                ? 'border-orange-500 bg-orange-50'
                                                : 'border-gray-300 bg-white hover:border-orange-300'
                                            }`}
                                    >
                                        <input
                                            type="radio"
                                            name="role"
                                            value={r.value}
                                            checked={formData.role === r.value}
                                            onChange={handleChange}
                                            className="w-4 h-4 text-orange-500"
                                        />
                                        <div className="ml-3 flex-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-2xl">{r.icon}</span>
                                                <span className="font-semibold text-gray-800">{r.label}</span>
                                            </div>
                                            <p className="text-sm text-gray-600">{r.description}</p>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold py-3 rounded-lg hover:from-orange-600 hover:to-red-600 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed mt-8"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <span className="animate-spin">⏳</span> Creating account...
                                </span>
                            ) : (
                                'Create Account'
                            )}
                        </button>
                    </form>

                    {/* Login Link */}
                    <p className="mt-6 text-center text-gray-600">
                        Already have an account?{' '}
                        <Link to="/login" className="text-orange-600 font-semibold hover:text-orange-700">
                            Sign In
                        </Link>
                    </p>
                </div>

                {/* Footer */}
                <div className="mt-8 text-center text-gray-600 text-sm">
                    <p>By signing up, you agree to our Terms & Privacy Policy</p>
                </div>
            </div>
        </div>
    );
};
