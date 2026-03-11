# Fix 500 Error - /api/menu/categories

## 🔍 Quick Fix Steps

### 1. Set Vercel Environment Variables (Backend)
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/restaurant_management
JWT_SECRET=your_secure_32_character_secret_here
NODE_ENV=production
PORT=5000
```

### 2. Test Backend Deployment
```
curl https://your-backend-url.vercel.app/test
curl https://your-backend-url.vercel.app/api/menu/health
```

### 3. Check Vercel Logs
- Vercel Dashboard → Backend Project → Functions → Logs
- Look for environment variable errors
- Look for MongoDB connection errors

### 4. Common Issues & Fixes

#### Issue: Missing MONGODB_URI
- Add MongoDB Atlas connection string
- Test connection locally first

#### Issue: Missing JWT_SECRET  
- Generate secure JWT secret
- Add to environment variables

#### Issue: Database Connection
- Check MongoDB Atlas whitelist
- Verify connection string format

## 🚀 Expected Result
After fixing environment variables:
✅ 200 OK for /api/menu/categories
✅ 200 OK for /api/menu
✅ No more 500 errors
