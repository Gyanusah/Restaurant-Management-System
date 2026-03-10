# ⚡ QUICK FIX - 500 Errors (Do This Now!)

## 🎯 The Problem
```
POST http://localhost:5000/api/orders 500 (Internal Server Error)
```

## ✅ The Solution (3 Steps)

### Step 1: Start MongoDB (2 minutes)
```bash
# Option A: Double-click this file in your project folder
start-mongodb.bat

# Option B: Run in Command Prompt
net start MongoDB
```

**✓ Wait 10 seconds for MongoDB to fully start**

### Step 2: Start Backend (1 minute)
```bash
cd backend
npm run dev
```

**Expected:**
```
✅ Server running on port 5000
✓ MongoDB Connected Successfully
```

**If you see "✗ MongoDB Connection Error":**
- Go back to Step 1
- Wait longer for MongoDB to start
- Run `start-mongodb.bat` again

### Step 3: Start Frontend (1 minute)
In a NEW Command Prompt window:
```bash
cd frontend
npm run dev
```

Open: http://localhost:5173

---

## 🧪 Test It

1. Sign up with any email/password
2. Browse menu
3. Add items to cart
4. Place order

**Should work now!** ✨

---

## 🆘 If still getting 500 errors:

### Check: Is MongoDB Running?
Open browser: http://localhost:27017

- ✅ Shows response = MongoDB is running
- ❌ Connection refused = MongoDB not running (run start-mongodb.bat)

### Check: Backend Logs
Look at the backend terminal. You should see:
```
✓ MongoDB Connected Successfully
✓ Menu items seeded successfully
✓ Test users seeded successfully
```

If you don't see this, your MongoDB is not connected.

### Quick Fix
```bash
# Kill everything
taskkill /F /IM node.exe

# Start MongoDB
start-mongodb.bat

# Wait 15 seconds
# Run backend again
cd backend
npm run dev
```

---

## 📋 Complete Checklist

- [ ] Run `start-mongodb.bat`
- [ ] See "MongoDB Connected" in cmd
- [ ] Run `npm run dev` in backend folder
- [ ] See "Server running on port 5000"
- [ ] Run `npm run dev` in frontend folder (new window!)
- [ ] Open http://localhost:5173
- [ ] Try to sign up and place order

---

## ✨ What Changed

The backend now:
- ✅ Auto-seeds database with menu items
- ✅ Creates test users automatically
- ✅ Better error messages
- ✅ Detailed logging so you can see what's happening

---

## 🎉 Done!

After these 3 steps, all 500 errors should be gone.

For more details, see: **FIX_500_ERRORS.md**
