import User from '../models/User.js';
import jwt from 'jsonwebtoken';

export const signup = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        const newUser = new User({
            name,
            email,
            password,
            role: role || 'customer',
        });

        await newUser.save();

        const token = jwt.sign(
            { id: newUser._id, email: newUser.email, role: newUser.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role,
            },
        });
    } catch (error) {
        res.status(500).json({ message: 'Signup failed', error: error.message });
    }
};

export const login = async (req, res) => {
    try {
        console.log('=== LOGIN DEBUG ===');
        console.log('Request body:', req.body);

        const { email, password } = req.body;

        if (!email || !password) {
            console.log('❌ Missing email or password');
            return res.status(400).json({ message: 'Email and password are required' });
        }

        console.log('🔍 Looking for user with email:', email);
        const user = await User.findOne({ email });
        console.log('👤 User found:', user ? 'YES' : 'NO');

        if (!user) {
            console.log('❌ User not found');
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        console.log('🔐 Comparing password...');
        const isPasswordValid = await user.comparePassword(password);
        console.log('🔐 Password valid:', isPasswordValid ? 'YES' : 'NO');

        if (!isPasswordValid) {
            console.log('❌ Password comparison failed');
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const token = jwt.sign(
            { id: user._id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        console.log('✅ Login successful for user:', user.email, 'Role:', user.role);
        res.status(200).json({
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        console.error('❌ Login error:', error);
        res.status(500).json({ message: 'Login failed', error: error.message });
    }
};

export const customerLogin = async (req, res) => {
    try {
        const { phoneNumber, name } = req.body;

        if (!phoneNumber) {
            return res.status(400).json({ message: 'Phone number is required' });
        }

        // Find or create customer by phone number
        let customer = await User.findOne({ phoneNumber, role: 'customer' });

        if (!customer) {
            // Create new customer account
            customer = new User({
                phoneNumber,
                role: 'customer',
                name: name || `Customer ${phoneNumber.slice(-4)}`, // Use provided name or default
                email: `customer_${phoneNumber}@restaurant.local`, // Default email
                password: 'customer123', // Default password (will be hashed)
            });

            await customer.save();
        } else if (name && name.trim()) {
            // Update name if provided and different from current
            if (customer.name !== name.trim()) {
                customer.name = name.trim();
                await customer.save();
            }
        }

        // Generate JWT token for customer
        const token = jwt.sign(
            { id: customer._id, phoneNumber: customer.phoneNumber, role: customer.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(200).json({
            message: 'Login successful',
            token,
            customerId: customer._id,
            name: customer.name,
            phoneNumber: customer.phoneNumber,
        });
    } catch (error) {
        console.error('Customer login error:', error);
        res.status(500).json({ message: 'Login failed', error: error.message });
    }
};
