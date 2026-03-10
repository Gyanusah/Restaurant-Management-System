import { Navigate } from 'react-router-dom';
import { useAuth } from '../utils/useAuth';

export const PrivateRoute = ({ children, requiredRole }) => {
    const { user, loading } = useAuth();
    
    console.log('=== PRIVATE ROUTE DEBUG ===');
    console.log('User:', user);
    console.log('Loading:', loading);
    console.log('Required role:', requiredRole);
    console.log('User role:', user?.role);
    console.log('Has required role:', requiredRole ? requiredRole.includes(user?.role) : 'No role required');

    if (loading) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }

    if (!user) {
        console.log('❌ No user found, redirecting to login');
        return <Navigate to="/login" />;
    }

    if (requiredRole && !requiredRole.includes(user.role)) {
        console.log('❌ Role mismatch, redirecting to unauthorized');
        return <Navigate to="/unauthorized" />;
    }

    console.log('✅ Access granted, rendering children');
    return children;
};
