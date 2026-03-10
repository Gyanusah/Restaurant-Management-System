# Restaurant Management System - Setup Guide

## Prerequisites

### 1. Node.js and npm
- Download from: https://nodejs.org/ (LTS version recommended)
- Verify installation:
  ```
  node --version
  npm --version
  ```

### 2. MongoDB
MongoDB is required for this application to work.

#### Option A: MongoDB Community Edition (Recommended for Development)
1. **Download**: https://www.mongodb.com/try/download/community
2. **Install**: Run the downloaded installer
3. **During Installation**:
   - ✓ Choose "Install MongoDB as a Service"
   - ✓ Make sure you select this option so it runs automatically
4. **Verify Installation**:
   ```
   mongod --version
   ```

#### Option B: MongoDB Atlas (Cloud Database)
1. Create a free account at https://www.mongodb.com/cloud/atlas
2. Create a cluster
3. Get your connection string
4. Update `.env` file with your MongoDB Atlas connection string
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/restaurant_management
   ```

#### Option C: Using Docker (Advanced)
```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

## Installation Steps

### 1. Install Backend Dependencies
```bash
cd backend
npm install
```

### 2. Install Frontend Dependencies
```bash
cd ../frontend
npm install
```

## Running MongoDB

### On Windows (If using local MongoDB):
**Option 1: Using the Batch Script**
```bash
cd restaurant-management-system
start-mongodb.bat
```

**Option 2: Start Service Manually**
1. Press `Win + R`
2. Type: `services.msc`
3. Find "MongoDB Server"
4. Right-click → Start

**Option 3: Using Command Line**
```bash
net start MongoDB
```

### Verify MongoDB is Running
Check terminal output or:
```bash
mongo --eval "db.adminCommand('ping')"
```

## Starting the Application

### Backend Server
```bash
cd backend
npm run dev
```
Expected output:
```
MongoDB Connected
Server running on port 5000
```

### Frontend Server (in a new terminal)
```bash
cd frontend
npm run dev
```
The app will open at `http://localhost:5173`

## Testing the Connection

### Health Check
- Open: http://localhost:5000/api/health
- Expected: `{"message":"Server is running"}`

### Database Status  
- Open: http://localhost:5000/api/db-status
- Expected: `{"message":"MongoDB is connected","connected":true}`

## Default Test Credentials

After signing up, you can use these credentials:
- **Customer**: customer@test.com / password
- **Kitchen Staff**: kitchen@test.com / password
- **Admin**: admin@test.com / password

## Troubleshooting

### MongoDB Connection Error
**Error**: `MongoDB is not connected`

**Solution**:
1. Ensure MongoDB is running (check `mongod` in terminal)
2. Check .env file has correct `MONGODB_URI`
3. Restart the backend server after MongoDB starts

### Port Already in Use
**Error**: `Port 5000 is already in use`

**Solution**:
- Change PORT in .env file
- Or kill the process using port 5000:
```bash
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### Module Not Found Errors
**Solution**:
```bash
cd backend
npm install
cd ../frontend
npm install
```

### CORS Errors
- Backend CORS is enabled on all routes
- Ensure frontend is running on `http://localhost:5173`
- Ensure backend is running on `http://localhost:5000`

## Environment Variables

### Backend (.env)
```env
MONGODB_URI=mongodb://localhost:27017/restaurant_management
JWT_SECRET=restaurant_management_system_secret_key_2026
PORT=5000
NODE_ENV=development
```

### Frontend (.env)
Frontend automatically connects to `http://localhost:5000/api`

## Project Structure
```
restaurant-management-system/
├── backend/
│   ├── config/          # Database configuration
│   ├── controllers/      # Route controllers
│   ├── middleware/       # Express middleware
│   ├── models/          # MongoDB schemas
│   ├── routes/          # API routes
│   ├── .env             # Environment variables
│   ├── server.js        # Entry point
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   ├── context/     # Context API
│   │   ├── api/         # API calls
│   │   └── utils/       # Utility functions
│   ├── index.html
│   └── package.json
└── start-mongodb.bat    # MongoDB startup script
```

## Features

✅ User authentication (Customer, Kitchen Staff, Admin)
✅ Menu management
✅ Order management
✅ Real-time order tracking
✅ Payment integration (Multiple payment methods)
✅ QR code generation for payments
✅ Order confirmation system
✅ Responsive UI with Tailwind CSS

## Need Help?

1. Check the terminal output for detailed error messages
2. Visit http://localhost:5000/api/db-status to check database connection
3. Ensure all dependencies are installed with `npm install`
4. Restart both backend and frontend servers

Happy coding! 🚀
