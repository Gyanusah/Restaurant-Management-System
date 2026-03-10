import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            console.error('❌ No token provided in request');
            return res.status(401).json({ message: 'No token provided' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('✅ Token verified for user:', decoded.email, 'Role:', decoded.role);

        req.user = decoded;
        next();
    } catch (error) {
        console.error('❌ Token verification failed:', error.message);
        return res.status(403).json({ message: 'Invalid or expired token' });
    }
};

export const authorizeRole = (...roles) => {
    return (req, res, next) => {
        const userRole = req.user?.role;
        console.log('🔐 Checking authorization - Required roles:', roles, 'User role:', userRole);
        console.log('🔍 Roles type:', typeof roles, 'Is array:', Array.isArray(roles));
        console.log('🔍 Roles content:', JSON.stringify(roles));
        console.log('🔍 User role type:', typeof userRole, 'User role value:', userRole);
        console.log('🔍 Includes result:', roles.includes(userRole));

        // Ensure roles is a flat array
        const allowedRoles = Array.isArray(roles[0]) ? roles[0] : roles;
        console.log('🔍 Flattened roles:', JSON.stringify(allowedRoles));
        console.log('🔍 Final includes result:', allowedRoles.includes(userRole));

        if (!allowedRoles.includes(userRole)) {
            console.error('❌ Access denied for role:', userRole);
            return res.status(403).json({ message: 'Access denied' });
        }

        console.log('✅ Authorization passed');
        next();
    };
};
