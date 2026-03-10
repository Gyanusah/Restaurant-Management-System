import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../api/api';
import { useAuth } from '../utils/useAuth';

export const LoginPage = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login: authLogin } = useAuth();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            console.log('=== LOGIN ATTEMPT ===');
            console.log('Form data:', formData);
            
            const response = await login(formData);
            console.log('Login response:', response.data);
            
            authLogin(response.data.user, response.data.token);
            console.log('After authLogin - User:', response.data.user, 'Token:', response.data.token);
            
            // Redirect based on role - kitchen, admin, and manager allowed
            if (response.data.user.role === 'admin') {
                navigate('/admin');
            } else if (response.data.user.role === 'kitchen') {
                navigate('/kitchen');
            } else if (response.data.user.role === 'manager') {
                navigate('/admin');
            } else {
                setError('Access denied. Only kitchen, admin, and manager staff can login.');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center py-12 px-4">
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="text-5xl mb-4">🍽️</div>
                    <h1 className="text-4xl font-bold text-gray-800 mb-2">FoodHub</h1>
                    <p className="text-gray-600">Staff Login - Kitchen, Admin & Manager</p>
                </div>

                {/* Form Container */}
                <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10">
                    {error && (
                        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded mb-6">
                            <p className="font-bold">Login Failed</p>
                            <p>{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Email Field */}
                        <div>
                            <label className="block text-gray-700 text-sm font-semibold mb-2">Email Address</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="you@example.com"
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition"
                                required
                            />
                        </div>

                        {/* Password Field */}
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-gray-700 text-sm font-semibold">Password</label>
                                <a href="#" className="text-blue-600 text-sm hover:text-blue-700">
                                    Forgot?
                                </a>
                            </div>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="••••••••"
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition"
                                required
                            />
                        </div>

                        {/* Remember Me */}
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="remember"
                                className="w-4 h-4 text-blue-600 rounded"
                            />
                            <label htmlFor="remember" className="ml-2 text-sm text-gray-600">
                                Keep me signed in
                            </label>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold py-3 rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed mt-8"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <span className="animate-spin">⏳</span> Signing in...
                                </span>
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </form>

                    {/* Sign Up Link */}
                    <p className="mt-6 text-center text-gray-600">
                        Don't have an account?{' '}
                        <Link to="/signup" className="text-blue-600 font-semibold hover:text-blue-700">
                            Create one
                        </Link>
                    </p>
                </div>

                {/* Demo Credentials */}
                {/* <div className="mt-8 bg-gray-100 rounded-lg p-4">
                    <p className="text-center text-sm text-gray-600 font-semibold mb-3">Demo Credentials</p>
                    <div className="space-y-2 text-xs text-gray-700">
                        <p>👤 <strong>Customer:</strong> customer@test.com / password</p>
                        <p>👨‍🍳 <strong>Kitchen:</strong> kitchen@test.com / password</p>
                        <p>⚙️ <strong>Admin:</strong> admin@test.com / password</p>
                    </div>
                </div> */}
            </div>
        </div>
    );
};
