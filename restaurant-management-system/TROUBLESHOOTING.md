# 🔧 Troubleshooting Guide - 500 Errors

## Problem: Getting "500 Internal Server Error"

You're seeing these errors:
```
POST http://localhost:5000/api/orders 500 (Internal Server Error)
POST http://localhost:5000/api/auth/login 500 (Internal Server Error)
```

## Root Cause

✗ **MongoDB is not running or not accessible**

The backend server is running, but it cannot connect to the MongoDB database.

---

## Solution

### Step 1: Start MongoDB

#### On Windows - Option A (Easiest)
Run the provided batch script in project root:
```bash
start-mongodb.bat
```

#### On Windows - Option B
Press `Win + R`, type:
```
services.msc
```
Then:
1. Find "MongoDB Server"
2. Right-click → Click "Start"

#### On Windows - Option C (Command Prompt)
Open Command Prompt and run:
```bash
net start MongoDB
```

#### Verify MongoDB is Running
Open your browser and visit:
```
http://localhost:27017
```
You should see a response (it's normal if it says "It looks like you are trying to access MongoDB over HTTP on the native driver port." - this means MongoDB is running!)

---

### Step 2: Verify Database Connection

Open browser and visit:
```
http://localhost:5000/api/db-status
```

You should see:
```json
{
  "message": "MongoDB is connected",
  "connected": true
}
```

If it says `"connected": false`, MongoDB is still not running. Go back to Step 1.

---

### Step 3: Restart Backend Server

Terminal 1 (Backend):
```bash
cd backend
npm run dev
```

You should see:
```
✓ MongoDB Connected Successfully
Server running on port 5000
```

Terminal 2 (Frontend):
```bash
cd frontend
npm run dev
```

---

### Step 4: Test the Application

1. Open http://localhost:5173
2. Try to sign up
3. You should no longer get 500 errors

---

## Still Getting Errors?

### Check MongoDB Installation

Make sure MongoDB is installed. Download from:
https://www.mongodb.com/try/download/community

During installation, **check** "Install MongoDB as a Service"

### Check Environment Variables

Backend/.env should have:
```
MONGODB_URI=mongodb://localhost:27017/restaurant_management
JWT_SECRET=restaurant_management_system_secret_key_2026
PORT=5000
NODE_ENV=development
```

### Check Ports

Make sure ports are not in use:
- Port 5000 (backend) - if used, change PORT in .env
- Port 5173 (frontend) - if used, Vite will use next available port
- Port 27017 (MongoDB) - default MongoDB port

### View Error Logs

Check terminal output for detailed error messages:
- Look for "✗ MongoDB Connection Error"
- Read the troubleshooting hints provided

---

## Quick Checklist

- [ ] MongoDB installed? (https://www.mongodb.com/try/download/community)
- [ ] MongoDB running? (run `start-mongodb.bat`)
- [ ] Backend running? (`npm run dev` in backend folder)
- [ ] Frontend running? (`npm run dev` in frontend folder)
- [ ] Check http://localhost:5000/api/db-status (should be `"connected": true`)
- [ ] Check http://localhost:5000/api/health (should show "Server is running")

---

## Common Issues

### "net start MongoDB" command not found
- MongoDB might not be installed as a service
- Download and install MongoDB Community Edition
- During installation, select "Install MongoDB as a Service"

### MongoDB service not starting
- MongoDB might already be running (check: `tasklist | find "mongod"`)
- Try opening Services and manually starting it
- Restart your computer

### Port 5000 already in use
- Another application is using port 5000
- Kill the process: `taskkill /F /IM node.exe`
- Or change PORT in backend/.env

### "connect ECONNREFUSED 127.0.0.1:27017"
- MongoDB is not running
- Run `start-mongodb.bat`
- Wait a few seconds for MongoDB to start
- Restart backend server

---

## Still Need Help?

1. ✅ Follow all steps above carefully
2. ✅ Check MongoDB is running with `start-mongodb.bat`
3. ✅ Restart ALL services (MongoDB, Backend, Frontend)
4. ✅ Check terminal and browser console for detailed errors
5. ✅ Clear browser cache (Ctrl+Shift+Delete)
6. ✅ Try again in a new browser window/incognito mode

**Most of the time, the issue is that MongoDB is not running. Simply run `start-mongodb.bat` and restart the backend server.**

---

Good luck! 🚀

If issues persist, check the detailed `SETUP_GUIDE.md` file.
