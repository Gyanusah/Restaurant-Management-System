# Restaurant Management System (MERN Stack)

A modern, full-stack restaurant management web application built with MongoDB, Express, React, and Node.js.

## Features

### 🔐 Authentication & Authorization
- Secure signup and login with JWT
- Role-based access control (Admin, Kitchen, Customer)
- Protected routes for different user roles

### 👨‍💼 Admin Dashboard
- **Menu Management**: Add, update, and delete menu items
- **Order Management**: View all orders with status tracking
- **User Management**: Monitor all users and their roles
- **Order Analytics**: Track order status (Pending, Preparing, Ready, Completed)

### 👨‍🍳 Kitchen Dashboard
- **Real-time Orders**: View pending and preparing orders
- **Order Details**: See table number, items, and quantities
- **Status Updates**: Change order status from Pending → Preparing → Ready
- **Auto-refresh**: Orders refresh every 5 seconds

### 🛒 Customer Portal
- **Browse Menu**: View all available menu items with descriptions and prices
- **Place Orders**: Add items to cart and place table-based orders
- **Track Orders**: Real-time order status tracking
- **Simple Interface**: User-friendly order placement system

## Tech Stack

### Frontend
- **React.js** (with Vite)
- **Tailwind CSS** - Responsive UI styling
- **React Router** - Navigation and routing
- **Axios** - HTTP client for API calls
- **Context API** - State management for authentication

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **JWT** - Secure authentication
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin resource sharing

## Project Structure

```
restaurant-management-system/
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── pages/           # Page components
│   │   ├── context/         # Auth context
│   │   ├── api/             # API services
│   │   ├── utils/           # Utility functions
│   │   ├── App.jsx          # Main app component
│   │   └── main.jsx         # Entry point
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
├── backend/                  # Node/Express backend
│   ├── models/              # Mongoose schemas
│   ├── controllers/         # Business logic
│   ├── routes/              # API endpoints
│   ├── middleware/          # Auth & error handling
│   ├── config/              # Database config
│   ├── server.js            # Express server
│   └── package.json
│
└── README.md
```

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB installed locally or MongoDB Atlas account
- npm or yarn

### Backend Setup

1. Navigate to backend folder:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file (copy from `.env.example`):
```
MONGODB_URI=mongodb://localhost:27017/restaurant_management
JWT_SECRET=your_jwt_secret_key_here
PORT=5000
NODE_ENV=development
```

4. Start MongoDB:
```bash
mongod
```

5. Run the backend:
```bash
npm run dev
```

Backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend folder:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

Frontend will open on `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login

### Menu (Public)
- `GET /api/menu` - Get all menu items
- `GET /api/menu/:id` - Get menu item by ID
- `POST /api/menu` (Admin) - Create menu item
- `PUT /api/menu/:id` (Admin) - Update menu item
- `DELETE /api/menu/:id` (Admin) - Delete menu item

### Orders
- `POST /api/orders` (Customer) - Create new order
- `GET /api/orders` (Admin/Kitchen) - Get all orders
- `GET /api/orders/customer/orders` (Customer) - Get customer's orders
- `GET /api/orders/:id` - Get order by ID
- `PUT /api/orders/:id/status` (Kitchen/Admin) - Update order status
- `DELETE /api/orders/:id` (Admin) - Delete order

## Default Test Credentials

### Admin Account
- Email: admin@restaurant.com
- Password: admin123
- Role: admin

### Kitchen Account
- Email: kitchen@restaurant.com
- Password: kitchen123
- Role: kitchen

### Customer Account
- Email: customer@restaurant.com
- Password: customer123
- Role: customer

## Usage Guide

### For Customers
1. Sign up or login with customer role
2. Browse the menu
3. Add items to cart
4. Enter table number
5. Place order
6. View order status in real-time

### For Kitchen Staff
1. Login with kitchen role
2. View pending orders on dashboard
3. Click "Start Preparing" to begin preparing
4. Click "Mark Ready" when order is complete
5. Dashboard auto-refreshes every 5 seconds

### For Admin
1. Login with admin role
2. Go to Menu Management to add/update/delete menu items
3. Go to Order Management to view all orders and update statuses
4. Monitor all restaurant operations

## Security Features

- ✅ JWT-based authentication with 7-day expiry
- ✅ Password hashing with bcryptjs
- ✅ Role-based access control (RBAC)
- ✅ Protected API endpoints
- ✅ Protected routes on frontend
- ✅ CORS enabled for safe cross-origin requests

## Future Enhancements

- 🔄 Real-time updates with WebSockets
- 💳 Online payment integration
- 📱 QR-code based table ordering
- 📊 Sales analytics and reports
- 🏪 Multi-branch restaurant support
- 📧 Email notifications for orders
- 🔔 Push notifications
- ⭐ Customer reviews and ratings

## Error Handling

- Comprehensive error messages for failed operations
- Validation for all inputs
- Proper HTTP status codes
- User-friendly error notifications

## Performance Optimizations

- Efficient database queries with Mongoose
- Token-based authentication (stateless)
- Auto-refresh on kitchen dashboard (5-second interval)
- Responsive Tailwind CSS for optimal performance

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## License

This project is licensed under the ISC License - see the LICENSE file for details.

## Support

For issues and questions:
1. Check existing issues on GitHub
2. Create a new issue with detailed description
3. Contact the development team

---

**Happy Coding! 🚀**
