// import MenuItem from '../models/MenuItem.js';
// import mongoose from 'mongoose';

// export const getAllMenuItems = async (req, res) => {
//     try {
//         console.log('📋 Fetching menu items...');
//         console.log('Database connection state:', mongoose.connection.readyState);

//         // Check database connection
//         if (mongoose.connection.readyState !== 1) {
//             console.error('❌ Database not connected');
//             return res.status(500).json({
//                 message: 'Database connection error',
//                 error: 'Unable to connect to database'
//             });
//         }

//         const menuItems = await MenuItem.find({ isAvailable: true });
//         console.log(`✅ Found ${menuItems.length} menu items`);

//         if (menuItems.length === 0) {
//             console.log('⚠️ No menu items found, checking if collection exists...');
//             const collections = await mongoose.connection.db.listCollections().toArray();
//             console.log('Available collections:', collections.map(c => c.name));
//         }

//         res.status(200).json(menuItems);
//     } catch (error) {
//         console.error('❌ Error fetching menu items:', error.message);
//         console.error('Full error:', error);

//         // Handle specific errors
//         if (error.name === 'MongoNetworkError' || error.name === 'MongoTimeoutError') {
//             return res.status(503).json({
//                 message: 'Database connection error',
//                 error: 'Unable to connect to database'
//             });
//         }

//         if (error.name === 'ValidationError') {
//             return res.status(400).json({
//                 message: 'Validation error',
//                 error: error.message
//             });
//         }

//         res.status(500).json({
//             message: 'Failed to fetch menu items',
//             error: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message
//         });
//     }
// };

// export const getMenuItemById = async (req, res) => {
//     try {
//         const menuItem = await MenuItem.findById(req.params.id);
//         if (!menuItem) {
//             return res.status(404).json({ message: 'Menu item not found' });
//         }
//         res.status(200).json(menuItem);
//     } catch (error) {
//         res.status(500).json({ message: 'Failed to fetch menu item', error: error.message });
//     }
// };

// export const createMenuItem = async (req, res) => {
//     try {
//         const { name, description, price, category, image, isAvailable, isFeatured } = req.body;

//         console.log('📝 Creating menu item:', { name, description, price, category, image, isAvailable, isFeatured });

//         const newMenuItem = new MenuItem({
//             name,
//             description,
//             price,
//             category,
//             image,
//             isAvailable: isAvailable !== undefined ? isAvailable : true,
//             isFeatured: isFeatured !== undefined ? isFeatured : false,
//         });

//         await newMenuItem.save();
//         console.log('✅ Menu item created successfully');
//         res.status(201).json({ message: 'Menu item created successfully', menuItem: newMenuItem });
//     } catch (error) {
//         console.error('❌ Error creating menu item:', error.message);
//         res.status(500).json({ message: 'Failed to create menu item', error: error.message });
//     }
// };

// export const updateMenuItem = async (req, res) => {
//     try {
//         const { name, description, price, category, image, isAvailable, isFeatured } = req.body;

//         console.log('📝 Updating menu item:', { name, description, price, category, image, isAvailable, isFeatured });

//         const menuItem = await MenuItem.findByIdAndUpdate(
//             req.params.id,
//             {
//                 name,
//                 description,
//                 price,
//                 category,
//                 image,
//                 isAvailable: isAvailable !== undefined ? isAvailable : true,
//                 isFeatured: isFeatured !== undefined ? isFeatured : false,
//             },
//             { new: true, runValidators: true }
//         );

//         if (!menuItem) {
//             return res.status(404).json({ message: 'Menu item not found' });
//         }

//         console.log('✅ Menu item updated successfully');
//         res.status(200).json({ message: 'Menu item updated successfully', menuItem });
//     } catch (error) {
//         console.error('❌ Error updating menu item:', error.message);
//         res.status(500).json({ message: 'Failed to update menu item', error: error.message });
//     }
// };

// export const deleteMenuItem = async (req, res) => {
//     try {
//         const menuItem = await MenuItem.findByIdAndDelete(req.params.id);
//         if (!menuItem) {
//             return res.status(404).json({ message: 'Menu item not found' });
//         }
//         res.status(200).json({ message: 'Menu item deleted successfully' });
//     } catch (error) {
//         res.status(500).json({ message: 'Failed to delete menu item', error: error.message });
//     }
// };


import MenuItem from '../models/MenuItem.js';
import mongoose from 'mongoose';

/**
 * GET ALL MENU ITEMS
 * GET /api/menu
 */
export const getAllMenuItems = async (req, res) => {
    try {
        console.log('📋 Fetching menu items...');

        // Fetch available menu items
        const menuItems = await MenuItem.find({ isAvailable: true });

        console.log(`✅ Found ${menuItems.length} menu items`);

        res.status(200).json(menuItems);

    } catch (error) {
        console.error('❌ Error fetching menu items:', error);

        res.status(500).json({
            message: 'Failed to fetch menu items',
            error: error.message
        });
    }
};

/**
 * GET MENU ITEM BY ID
 * GET /api/menu/:id
 */
export const getMenuItemById = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate MongoDB ID
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid menu item ID' });
        }

        const menuItem = await MenuItem.findById(id);

        if (!menuItem) {
            return res.status(404).json({ message: 'Menu item not found' });
        }

        res.status(200).json(menuItem);

    } catch (error) {
        console.error('❌ Error fetching menu item:', error);

        res.status(500).json({
            message: 'Failed to fetch menu item',
            error: error.message
        });
    }
};

/**
 * CREATE MENU ITEM
 * POST /api/menu
 */
export const createMenuItem = async (req, res) => {
    try {
        const {
            name,
            description,
            price,
            category,
            image,
            isAvailable,
            isFeatured
        } = req.body;

        console.log('📝 Creating menu item:', req.body);

        const newMenuItem = new MenuItem({
            name,
            description,
            price,
            category,
            image,
            isAvailable: isAvailable !== undefined ? isAvailable : true,
            isFeatured: isFeatured !== undefined ? isFeatured : false,
        });

        await newMenuItem.save();

        console.log('✅ Menu item created successfully');

        res.status(201).json({
            message: 'Menu item created successfully',
            menuItem: newMenuItem
        });

    } catch (error) {
        console.error('❌ Error creating menu item:', error);

        res.status(500).json({
            message: 'Failed to create menu item',
            error: error.message
        });
    }
};

/**
 * UPDATE MENU ITEM
 * PUT /api/menu/:id
 */
export const updateMenuItem = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid menu item ID' });
        }

        const updatedItem = await MenuItem.findByIdAndUpdate(
            id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!updatedItem) {
            return res.status(404).json({ message: 'Menu item not found' });
        }

        console.log('✅ Menu item updated successfully');

        res.status(200).json({
            message: 'Menu item updated successfully',
            menuItem: updatedItem
        });

    } catch (error) {
        console.error('❌ Error updating menu item:', error);

        res.status(500).json({
            message: 'Failed to update menu item',
            error: error.message
        });
    }
};

/**
 * DELETE MENU ITEM
 * DELETE /api/menu/:id
 */
export const deleteMenuItem = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid menu item ID' });
        }

        const deletedItem = await MenuItem.findByIdAndDelete(id);

        if (!deletedItem) {
            return res.status(404).json({ message: 'Menu item not found' });
        }

        console.log('🗑️ Menu item deleted');

        res.status(200).json({
            message: 'Menu item deleted successfully'
        });

    } catch (error) {
        console.error('❌ Error deleting menu item:', error);

        res.status(500).json({
            message: 'Failed to delete menu item',
            error: error.message
        });
    }
};