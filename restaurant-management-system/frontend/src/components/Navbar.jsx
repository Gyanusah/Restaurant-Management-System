import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../utils/useAuth';
import { useState } from 'react';

export const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuth();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isActive = (path) => location.pathname === path ? 'text-orange-500' : 'text-gray-700 hover:text-orange-500';

    return (
        <nav className="bg-white shadow-lg sticky top-0 z-40">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <div
                        onClick={() => navigate('/')}
                        className="flex items-center gap-2 cursor-pointer"
                    >
                        <div className="text-3xl">🍽️</div>
                        <span className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                            FoodHub
                        </span>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-8">
                        <a href="/" className={`font-semibold transition ${isActive('/')}`}>Home</a>

                        {user ? (
                            <>
                                <span className="text-sm text-gray-600">
                                    Welcome, <strong>{user.name}</strong> ({user.role})
                                </span>
                                {user.role === 'customer' && (
                                    <button
                                        onClick={() => navigate('/customer')}
                                        className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition font-semibold"
                                    >
                                        Order Now
                                    </button>
                                )}
                                {user.role === 'kitchen' && (
                                    <button
                                        onClick={() => navigate('/kitchen')}
                                        className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition font-semibold"
                                    >
                                        Kitchen Dashboard
                                    </button>
                                )}
                                {user.role === 'admin' && (
                                    <button
                                        onClick={() => navigate('/admin')}
                                        className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition font-semibold"
                                    >
                                        Admin Panel
                                    </button>
                                )}
                                <button
                                    onClick={handleLogout}
                                    className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition font-semibold"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    onClick={() => navigate('/login')}
                                    className="text-gray-700 font-semibold hover:text-orange-500 transition"
                                >
                                    Sign In
                                </button>
                                <button
                                    onClick={() => navigate('/signup')}
                                    className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-2 rounded-lg hover:shadow-lg transition font-semibold"
                                >
                                    Sign Up
                                </button>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden text-gray-800 text-2xl"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        ≡
                    </button>
                </div>

                {/* Mobile Navigation */}
                {mobileMenuOpen && (
                    <div className="md:hidden pb-4 border-t border-gray-200">
                        <div className="space-y-3 py-4">
                            <a href="/" className="block font-semibold text-gray-700 hover:text-orange-500">Home</a>

                            {user ? (
                                <>
                                    <div className="text-sm text-gray-600 py-2">
                                        Welcome, <strong>{user.name}</strong> ({user.role})
                                    </div>
                                    {user.role === 'customer' && (
                                        <button
                                            onClick={() => navigate('/customer')}
                                            className="w-full text-left bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold"
                                        >
                                            Order Now
                                        </button>
                                    )}
                                    {user.role === 'kitchen' && (
                                        <button
                                            onClick={() => navigate('/kitchen')}
                                            className="w-full text-left bg-green-500 text-white px-4 py-2 rounded-lg font-semibold"
                                        >
                                            Kitchen Dashboard
                                        </button>
                                    )}
                                    {user.role === 'admin' && (
                                        <button
                                            onClick={() => navigate('/admin')}
                                            className="w-full text-left bg-purple-500 text-white px-4 py-2 rounded-lg font-semibold"
                                        >
                                            Admin Panel
                                        </button>
                                    )}
                                    <button
                                        onClick={handleLogout}
                                        className="w-full text-left bg-red-500 text-white px-4 py-2 rounded-lg font-semibold"
                                    >
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button
                                        onClick={() => navigate('/login')}
                                        className="w-full text-left font-semibold text-gray-700"
                                    >
                                        Sign In
                                    </button>
                                    <button
                                        onClick={() => navigate('/signup')}
                                        className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-lg font-semibold"
                                    >
                                        Sign Up
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
};
