import mongoose from 'mongoose';
import MenuItem from '../models/MenuItem.js';
import User from '../models/User.js';

const seedDatabase = async () => {
    try {
        // Wait for MongoDB connection
        if (mongoose.connection.readyState === 1) {
            console.log('🌱 Starting database seeding...');

            // Seed Menu Items - always reseed to include favorite field
            console.log('📝 Seeding menu items with favorite field...');

            // Clear existing menu items to ensure fresh data with favorite field
            await MenuItem.deleteMany({});
            console.log('�️ Cleared existing menu items');

            const menuItems = [
                {
                    name: 'Margherita Pizza',
                    description: 'Classic pizza with mozzarella and tomato',
                    price: 12.99,
                    category: 'main',
                    image: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
                    isAvailable: true,
                    isFeatured: true,
                    isFavorite: true,
                },
                {
                    name: 'Grilled Salmon',
                    description: 'Fresh salmon with lemon butter sauce',
                    price: 18.99,
                    category: 'main',
                    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
                    isAvailable: true,
                    isFeatured: true,
                    isFavorite: false,
                },
                {
                    name: 'Caesar Salad',
                    description: 'Crisp lettuce with parmesan and croutons',
                    price: 9.99,
                    category: 'appetizer',
                    image: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
                    isAvailable: true,
                    isFeatured: false,
                    isFavorite: true,
                },
                {
                    name: 'Chocolate Cake',
                    description: 'Decadent chocolate cake with ice cream',
                    price: 7.99,
                    category: 'dessert',
                    image: 'https://tse2.mm.bing.net/th/id/OIP.zaXQaO3PVMBdxVkBlGZrPQHaE8?pid=Api&P=0&h=180',
                    isAvailable: true,
                    isFeatured: false,
                    isFavorite: true,
                },
                {
                    name: 'Iced Tea',
                    description: 'Refreshing iced tea with lemon',
                    price: 3.99,
                    category: 'beverage',
                    image: 'https://tse3.mm.bing.net/th/id/OIP.FPfb0bTFioJeCoKmlZIShgHaHa?pid=Api&P=0&h=180',
                    isAvailable: true,
                    isFeatured: false,
                    isFavorite: false,
                },
                {
                    name: 'Burger',
                    description: 'Juicy beef burger with all the toppings',
                    price: 10.99,
                    category: 'main',
                    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
                    isAvailable: true,
                    isFeatured: true,
                    isFavorite: true,
                },
                {
                    name: 'French Fries',
                    description: 'Crispy golden french fries',
                    price: 4.99,
                    category: 'appetizer',
                    image: 'https://tse2.mm.bing.net/th/id/OIP.nVkw4-DqH9vtYpMOvb5GnwHaEJ?pid=Api&P=0&h=180',
                    isAvailable: true,
                    isFeatured: false,
                    isFavorite: true,
                },
                {
                    name: 'Coffee',
                    description: 'Hot coffee with various options',
                    price: 2.99,
                    category: 'beverage',
                    image: 'https://tse3.mm.bing.net/th/id/OIP.R4Egmlw5YcT7XjVMYlmYkwHaE8?pid=Api&P=0&h=180',
                    isAvailable: true,
                    isFeatured: false,
                    isFavorite: false,
                },
            ];

            await MenuItem.insertMany(menuItems);
            console.log('✓ Menu items seeded successfully');

            // Seed Users if collection is empty
            const userCount = await User.countDocuments();
            if (userCount === 0) {
                console.log('👥 Seeding test users...');
                const users = [
                    {
                        name: 'Customer User',
                        email: 'customer@test.com',
                        password: 'password123',
                        phoneNumber: '1234567890',
                        role: 'customer',
                    },
                    {
                        name: 'Kitchen Staff',
                        email: 'kitchen@test.com',
                        password: 'password123',
                        phoneNumber: '1234567891',
                        role: 'kitchen',
                    },
                    {
                        name: 'Manager User',
                        email: 'manager@test.com',
                        password: 'password123',
                        phoneNumber: '1234567892',
                        role: 'manager',
                    },
                    {
                        name: 'Admin User',
                        email: 'admin@test.com',
                        password: 'password1234',
                        phoneNumber: '1234567893',
                        role: 'admin',
                    },
                    {
                        name: 'Gyanendra',
                        email: 'gyanu@gmail.com',
                        password: '123456789',
                        phoneNumber: '9826753125',
                        role: 'admin',
                    }
                ];

                await User.insertMany(users);
                console.log('✓ Test users seeded successfully');
            } else {
                console.log(`✓ Database already has ${userCount} users`);
            }

            console.log('✓ Database seeding completed');
        }
    } catch (error) {
        console.error('✗ Error seeding database:', error.message);
    }
};

export default seedDatabase;
