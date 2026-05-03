# 🚀 Deployment Guide - Project Management SaaS

## Overview
This guide provides step-by-step instructions for deploying the Project Management SaaS application to production.

---

## 📋 Prerequisites

1. **GitHub Account** - Code repository
2. **MongoDB Atlas Account** - Database hosting
3. **Vercel Account** - Frontend hosting (free tier)
4. **Render Account** - Backend hosting (free tier)

---

## 🗄️ Step 1: Set Up MongoDB Atlas

### 1.1 Create MongoDB Cluster
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up or log in
3. Click "Build a Database"
4. Choose **FREE** tier (M0 Sandbox)
5. Select a cloud provider and region (closest to your users)
6. Name your cluster (e.g., "ProjectManagement")
7. Click "Create"

### 1.2 Configure Database Access
1. Go to "Database Access" in left sidebar
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Create username and strong password
5. Set user privileges to "Read and write to any database"
6. Click "Add User"

### 1.3 Configure Network Access
1. Go to "Network Access" in left sidebar
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (0.0.0.0/0)
   - **Note:** For production, restrict to specific IPs
4. Click "Confirm"

### 1.4 Get Connection String
1. Go to "Database" in left sidebar
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Copy the connection string
5. Replace `<password>` with your database user password
6. Replace `<dbname>` with `project_management_saas`

**Example:**
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/project_management_saas?retryWrites=true&w=majority
```

---

## 🔧 Step 2: Deploy Backend to Render

### 2.1 Push Code to GitHub
```bash
git add .
git commit -m "Prepare for deployment"
git push origin main
```

### 2.2 Create Render Service
1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Select the repository: `ProjectManagementSaaS`

### 2.3 Configure Service
**Basic Settings:**
- **Name:** `project-management-backend`
- **Region:** Choose closest to your users
- **Branch:** `main`
- **Root Directory:** `backend`
- **Runtime:** `Node`
- **Build Command:** `npm install`
- **Start Command:** `npm start`

**Instance Type:**
- Select **Free** tier

### 2.4 Add Environment Variables
Click "Advanced" and add these environment variables:

```env
NODE_ENV=production
PORT=10000
MONGO_URI=<your-mongodb-atlas-connection-string>
JWT_SECRET=<generate-random-string-64-chars>
JWT_REFRESH_SECRET=<generate-random-string-64-chars>
JWT_EXPIRE=7d
JWT_REFRESH_EXPIRE=30d
CORS_ORIGIN=<your-vercel-frontend-url>
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads
```

**Generate JWT Secrets:**
```bash
# Run in terminal to generate random secrets
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 2.5 Deploy
1. Click "Create Web Service"
2. Wait for deployment (5-10 minutes)
3. Once deployed, copy the service URL (e.g., `https://project-management-backend.onrender.com`)

### 2.6 Test Backend
Visit: `https://your-backend-url.onrender.com/api/health`

Should return:
```json
{
  "status": "OK",
  "timestamp": "2026-05-03T13:40:00.000Z",
  "uptime": 123.456,
  "environment": "production"
}
```

---

## 🎨 Step 3: Deploy Frontend to Vercel

### 3.1 Create Vercel Project
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Select `ProjectManagementSaaS`

### 3.2 Configure Project
**Framework Preset:** Vite

**Root Directory:** `frontend`

**Build Settings:**
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`

### 3.3 Add Environment Variables
Click "Environment Variables" and add:

```env
VITE_API_URL=https://your-backend-url.onrender.com/api
```

**Important:** Replace `your-backend-url.onrender.com` with your actual Render backend URL.

### 3.4 Deploy
1. Click "Deploy"
2. Wait for deployment (2-5 minutes)
3. Once deployed, you'll get a URL (e.g., `https://project-management-saas.vercel.app`)

### 3.5 Update Backend CORS
1. Go back to Render dashboard
2. Open your backend service
3. Go to "Environment"
4. Update `CORS_ORIGIN` to your Vercel URL:
   ```
   CORS_ORIGIN=https://your-app.vercel.app
   ```
5. Save changes (service will redeploy)

---

## ✅ Step 4: Verify Deployment

### 4.1 Test Backend
```bash
# Health check
curl https://your-backend-url.onrender.com/api/health

# Register user
curl -X POST https://your-backend-url.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'
```

### 4.2 Test Frontend
1. Visit your Vercel URL
2. Try to register a new account
3. Login with credentials
4. Create a project
5. Create a task
6. Test Kanban board drag-and-drop

### 4.3 Check Real-time Features
1. Open app in two browser windows
2. Login with same account in both
3. Create/update a task in one window
4. Verify it updates in the other window

---

## 🔒 Step 5: Security Checklist

### Backend Security
- ✅ Strong JWT secrets (64+ characters)
- ✅ CORS configured to specific frontend URL
- ✅ MongoDB connection string secured
- ✅ Environment variables not in code
- ✅ HTTPS enabled (automatic on Render)

### Frontend Security
- ✅ API URL uses HTTPS
- ✅ No sensitive data in frontend code
- ✅ Environment variables properly set
- ✅ HTTPS enabled (automatic on Vercel)

### Database Security
- ✅ Strong database password
- ✅ Network access configured
- ✅ Database user has minimal required permissions

---

## 📊 Step 6: Monitoring & Maintenance

### Render Monitoring
1. Go to Render dashboard
2. Click on your service
3. View logs in "Logs" tab
4. Monitor metrics in "Metrics" tab

### Vercel Monitoring
1. Go to Vercel dashboard
2. Click on your project
3. View deployments and analytics
4. Check function logs

### MongoDB Monitoring
1. Go to MongoDB Atlas dashboard
2. Click on your cluster
3. View "Metrics" tab for performance
4. Set up alerts for issues

---

## 🔄 Step 7: Continuous Deployment

### Automatic Deployments
Both Render and Vercel are configured for automatic deployments:

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Your changes"
   git push origin main
   ```

2. **Automatic Triggers:**
   - Render will automatically rebuild backend
   - Vercel will automatically rebuild frontend

3. **Monitor Deployments:**
   - Check Render dashboard for backend status
   - Check Vercel dashboard for frontend status

---

## 🐛 Troubleshooting

### Backend Issues

**Problem:** Backend not starting
- Check Render logs for errors
- Verify all environment variables are set
- Check MongoDB connection string

**Problem:** CORS errors
- Verify `CORS_ORIGIN` matches frontend URL exactly
- Include protocol (https://)
- No trailing slash

**Problem:** Database connection failed
- Check MongoDB Atlas network access
- Verify connection string is correct
- Check database user credentials

### Frontend Issues

**Problem:** API calls failing
- Verify `VITE_API_URL` is correct
- Check backend is running
- Open browser console for errors

**Problem:** Build failing
- Check Vercel build logs
- Verify all dependencies in package.json
- Check for import errors

**Problem:** Environment variables not working
- Ensure variables start with `VITE_`
- Redeploy after adding variables
- Clear cache and rebuild

---

## 📈 Performance Optimization

### Backend Optimization
1. **Enable Compression:**
   - Already configured in Express
2. **Database Indexing:**
   - Add indexes to frequently queried fields
3. **Caching:**
   - Implement Redis for session storage (optional)

### Frontend Optimization
1. **Code Splitting:**
   - Already implemented with React.lazy()
2. **Image Optimization:**
   - Use WebP format
   - Implement lazy loading
3. **CDN:**
   - Vercel automatically uses CDN

---

## 💰 Cost Estimation

### Free Tier Limits

**Render (Free):**
- 750 hours/month
- Sleeps after 15 min inactivity
- 512 MB RAM
- Shared CPU

**Vercel (Free):**
- 100 GB bandwidth/month
- Unlimited deployments
- Automatic HTTPS
- Global CDN

**MongoDB Atlas (Free):**
- 512 MB storage
- Shared RAM
- No backup

### Upgrade Recommendations
- **For Production:** Upgrade Render to $7/month for always-on service
- **For Scale:** Upgrade MongoDB to $9/month for 2GB storage
- **For Team:** Vercel Pro at $20/month for team features

---

## 🎯 Post-Deployment Checklist

- [ ] Backend deployed and accessible
- [ ] Frontend deployed and accessible
- [ ] Database connected and working
- [ ] User registration working
- [ ] User login working
- [ ] Projects CRUD working
- [ ] Tasks CRUD working
- [ ] Kanban board working
- [ ] File upload working
- [ ] Real-time updates working
- [ ] Dark mode working
- [ ] Responsive on mobile
- [ ] HTTPS enabled
- [ ] Environment variables secured
- [ ] Monitoring set up
- [ ] Backup strategy planned

---

## 📚 Additional Resources

- [Render Documentation](https://render.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [Express.js Best Practices](https://expressjs.com/en/advanced/best-practice-performance.html)
- [React Production Build](https://react.dev/learn/start-a-new-react-project#production-grade-react-frameworks)

---

## 🆘 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review deployment logs
3. Check environment variables
4. Verify database connection
5. Test API endpoints individually

---

**Deployment Guide Version:** 1.0.0  
**Last Updated:** 2026-05-03  
**Made with Bob** ❤️