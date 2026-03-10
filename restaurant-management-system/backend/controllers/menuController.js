import MenuItem from '../models/MenuItem.js';

export const getAllMenuItems = async (req, res) => {
    try {
        console.log('📋 Fetching menu items...');
        const menuItems = await MenuItem.find({ isAvailable: true });
        console.log(`✅ Found ${menuItems.length} menu items`);
        res.status(200).json(menuItems);
    } catch (error) {
        console.error('❌ Error fetching menu items:', error.message);
        res.status(500).json({ message: 'Failed to fetch menu items', error: error.message });
    }
};

export const getMenuItemById = async (req, res) => {
    try {
        const menuItem = await MenuItem.findById(req.params.id);
        if (!menuItem) {
            return res.status(404).json({ message: 'Menu item not found' });
        }
        res.status(200).json(menuItem);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch menu item', error: error.message });
    }
};

export const createMenuItem = async (req, res) => {
    try {
        const { name, description, price, category, image, isAvailable, isFeatured } = req.body;

        console.log('📝 Creating menu item:', { name, description, price, category, image, isAvailable, isFeatured });

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
        res.status(201).json({ message: 'Menu item created successfully', menuItem: newMenuItem });
    } catch (error) {
        console.error('❌ Error creating menu item:', error.message);
        res.status(500).json({ message: 'Failed to create menu item', error: error.message });
    }
};

export const updateMenuItem = async (req, res) => {
    try {
        const { name, description, price, category, image, isAvailable, isFeatured } = req.body;

        console.log('📝 Updating menu item:', { name, description, price, category, image, isAvailable, isFeatured });

        const menuItem = await MenuItem.findByIdAndUpdate(
            req.params.id,
            {
                name,
                description,
                price,
                category,
                image,
                isAvailable: isAvailable !== undefined ? isAvailable : true,
                isFeatured: isFeatured !== undefined ? isFeatured : false,
            },
            { new: true, runValidators: true }
        );

        if (!menuItem) {
            return res.status(404).json({ message: 'Menu item not found' });
        }

        console.log('✅ Menu item updated successfully');
        res.status(200).json({ message: 'Menu item updated successfully', menuItem });
    } catch (error) {
        console.error('❌ Error updating menu item:', error.message);
        res.status(500).json({ message: 'Failed to update menu item', error: error.message });
    }
};

export const deleteMenuItem = async (req, res) => {
    try {
        const menuItem = await MenuItem.findByIdAndDelete(req.params.id);
        if (!menuItem) {
            return res.status(404).json({ message: 'Menu item not found' });
        }
        res.status(200).json({ message: 'Menu item deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete menu item', error: error.message });
    }
};
