import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false,
    },
    tableNumber: {
        type: Number,
        required: true,
    },
    items: [
        {
            menuItemId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'MenuItem',
                required: false,
            },
            name: String,
            quantity: {
                type: Number,
                required: true,
            },
            price: Number,
        },
    ],
    status: {
        type: String,
        enum: ['pending', 'preparing', 'ready', 'completed', 'cancelled'],
        default: 'pending',
    },
    totalAmount: {
        type: Number,
        required: true,
    },
    specialInstructions: {
        type: String,
    },
    // Payment Information
    paymentMethod: {
        type: String,
        enum: ['card', 'qr', 'upi', 'cash', null],
        default: null,
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: 'pending',
    },
    paymentId: {
        type: String,
        unique: true,
        sparse: true,
    },
    paymentTimestamp: {
        type: Date,
    },
    // Order Confirmation
    isConfirmed: {
        type: Boolean,
        default: false,
    },
    confirmationCode: {
        type: String,
        unique: true,
        sparse: true,
    },
    estimatedTime: {
        type: Number, // in minutes
        default: 30,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
}, { timestamps: true });

export default mongoose.model('Order', orderSchema);
