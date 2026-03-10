import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: function () {
            // Email is required for admin/kitchen, optional for customer
            return this.role !== 'customer';
        },
        unique: true,
        sparse: true, // Allows multiple null values for customers
        lowercase: true,
    },
    phoneNumber: {
        type: String,
        required: function () {
            // Phone number is required for customer, optional for staff
            return this.role === 'customer';
        },
        unique: true,
        sparse: true, // Allows multiple null values for staff
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ['admin', 'manager', 'kitchen', 'customer'],
        default: 'customer',
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Method to compare password
userSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model('User', userSchema);
