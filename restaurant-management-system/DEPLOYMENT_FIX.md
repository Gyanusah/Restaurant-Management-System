# Fix 404 Errors - Menu Endpoints Not Working

## 🔍 Problem Analysis

The frontend is getting 404 errors for:
- `https://restaurant-management-system-gilt.vercel.app/menu` 
- `https://restaurant-management-system-gilt.vercel.app/menu/categories`

**Root Cause**: The frontend is trying to access the backend at the frontend URL. The backend needs to be deployed separately.

## 🚀 Solution Steps

### Step 1: Deploy Backend Separately

1. **Create a new Vercel project for the backend**
   - Go to Vercel Dashboard
   - Click "Add New" → "Project"
   - Connect to your GitHub repository
   - Select only the `/backend` folder
   - Set root directory to `backend`

2. **Set Backend Environment Variables**
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/restaurant_management
   JWT_SECRET=your_secure_jwt_secret_here
   NODE_ENV=production
   PORT=5000
   ```

3. **Get Backend URL**
   After deployment, your backend URL will be something like:
   ```
   https://restaurant-management-backend-xyz.vercel.app
   ```

### Step 2: Update Frontend Environment Variables

1. **Go to Frontend Project Settings**
   - Vercel Dashboard → Frontend Project → Settings → Environment Variables

2. **Set the correct backend URL**
   ```
   VITE_API_BASE_URL=https://your-backend-url.vercel.app
   ```

### Step 3: Test the Endpoints

After deployment, test these URLs:
```
✅ https://your-backend-url.vercel.app/test
✅ https://your-backend-url.vercel.app/menu
✅ https://your-backend-url.vercel.app/menu/categories
✅ https://your-backend-url.vercel.app/menu/featured
```

## 🔧 Quick Fix for Testing

### Option A: Use Local Backend for Testing
```bash
# In backend folder
npm run dev

# Set frontend environment variable
VITE_API_BASE_URL=http://localhost:5000
```

### Option B: Use Railway/Render for Backend
Deploy backend to Railway or Render:
1. Connect your GitHub repository
2. Set environment variables
3. Get the backend URL
4. Update frontend environment variable

## 📊 Expected Results

After proper deployment:
```
✅ Frontend: https://restaurant-management-system-gilt.vercel.app
✅ Backend: https://restaurant-management-backend-xyz.vercel.app
✅ API calls: Frontend → Backend → Database
```

## 🔍 Debug Steps

If still getting 404s:

1. **Check backend deployment logs**
   - Vercel Dashboard → Backend Project → Functions → Logs

2. **Test backend directly**
   ```bash
   curl https://your-backend-url.vercel.app/test
   ```

3. **Check environment variables**
   - Verify `VITE_API_BASE_URL` is set correctly in frontend

4. **Check CORS configuration**
   - Backend should allow requests from frontend URL

## 🚨 Important Notes

- **Frontend and Backend must be deployed separately**
- **Frontend URL ≠ Backend URL**
- **Environment variables must be set for both projects**
- **Backend needs MongoDB Atlas connection string**
