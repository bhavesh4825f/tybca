# 🚀 Free Deployment Guide for Digital Government Service Consultancy

This guide will help you deploy your application online **completely free** using:
- **MongoDB Atlas** (Free 512MB database)
- **Render** (Free backend hosting)
- **Vercel or Netlify** (Free frontend hosting)

---

## 📋 Prerequisites

1. GitHub account (to deploy code)
2. MongoDB Atlas account (for database)
3. Render account (for backend)
4. Vercel or Netlify account (for frontend)

---

## Part 1️⃣: Setup MongoDB Atlas (Free Database)

### Step 1: Create MongoDB Atlas Account
1. Go to https://www.mongodb.com/cloud/atlas/register
2. Sign up for a free account
3. Create a new cluster (select **FREE** M0 tier)
4. Choose a cloud provider and region closest to you
5. Click "Create Cluster"

### Step 2: Setup Database Access
1. In Atlas dashboard, go to **Database Access** (left sidebar)
2. Click **Add New Database User**
3. Choose **Password** authentication
4. Create username and password (save these!)
5. Set privileges to **Read and write to any database**
6. Click **Add User**

### Step 3: Setup Network Access
1. Go to **Network Access** (left sidebar)
2. Click **Add IP Address**
3. Click **Allow Access from Anywhere** (0.0.0.0/0)
4. Click **Confirm**

### Step 4: Get Connection String
1. Go to **Database** (left sidebar)
2. Click **Connect** on your cluster
3. Choose **Connect your application**
4. Copy the connection string (looks like):
   ```
   mongodb+srv://username:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. Replace `<password>` with your actual database password
6. Add database name before the `?`:
   ```
   mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/dgsc?retryWrites=true&w=majority
   ```

---

## Part 2️⃣: Deploy Backend to Render

### Step 1: Push Code to GitHub
```powershell
# Navigate to your project root
cd "c:\Users\BHAVESH\Desktop\backup of project\Digital Government Service Consultancy"

# Initialize git repository
git init

# Add all files
git add .

# Commit files
git commit -m "Initial commit for deployment"

# Create a new repository on GitHub (via web interface)
# Then link and push:
git remote add origin https://github.com/bhavesh4825f/tybca.git
git branch -M main
git push -u origin main
```

### Step 2: Create Render Account & Deploy
1. Go to https://render.com and sign up (use GitHub login)
2. Click **New +** → **Web Service**
3. Connect your GitHub repository
4. Select your repository
5. Configure the service:
   - **Name**: dgsc-backend (or any name you like)
   - **Region**: Choose closest to you
   - **Branch**: main
   - **Root Directory**: backend
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free

### Step 3: Add Environment Variables
In Render dashboard, go to **Environment** tab and add:

| Key | Value |
|-----|-------|
| `NODE_ENV` | production |
| `MONGODB_URI` | [Your MongoDB Atlas connection string from Part 1] |
| `JWT_SECRET` | [Generate a random string, e.g., use https://randomkeygen.com/] |
| `FRONTEND_URL` | https://your-frontend-url.vercel.app (will update later) |

Click **Save Changes**

### Step 4: Get Backend URL
1. After deployment completes, copy your backend URL
2. It will be like: `https://dgsc-backend.onrender.com`
3. Save this URL - you'll need it for frontend

⚠️ **Note**: Free Render services sleep after 15 minutes of inactivity. First request after sleep may take 30-60 seconds.

---

## Part 3️⃣: Deploy Frontend to Vercel

### Step 1: Update Environment Configuration
1. Edit `frontend/src/environments/environment.prod.ts`
2. Replace `your-backend-url.onrender.com` with your actual Render URL:
   ```typescript
   export const environment = {
     production: true,
     apiUrl: 'https://dgsc-backend.onrender.com/api',
     baseUrl: 'https://dgsc-backend.onrender.com'
   };
   ```
3. Commit and push changes:
   ```powershell
   git add .
   git commit -m "Update production API URL"
   git push
   ```

### Step 2: Deploy to Vercel
1. Go to https://vercel.com and sign up (use GitHub login)
2. Click **Add New** → **Project**
3. Import your GitHub repository
4. Configure project:
   - **Framework Preset**: Angular
   - **Root Directory**: frontend
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist/dgsc-frontend/browser`
5. Click **Deploy**

### Step 3: Update Backend CORS
1. Copy your Vercel deployment URL (e.g., `https://your-app.vercel.app`)
2. Go back to Render dashboard
3. Update `FRONTEND_URL` environment variable with your Vercel URL
4. Save changes (backend will auto-redeploy)

---

## Alternative: Deploy Frontend to Netlify

### Step 1: Deploy to Netlify
1. Go to https://netlify.com and sign up (use GitHub login)
2. Click **Add new site** → **Import an existing project**
3. Choose **Deploy with GitHub**
4. Select your repository
5. Configure build settings:
   - **Base directory**: frontend
   - **Build command**: `npm run build`
   - **Publish directory**: `dist/dgsc-frontend/browser`
6. Click **Deploy site**

### Step 2: Update Backend CORS
1. Copy your Netlify URL (e.g., `https://your-app.netlify.app`)
2. Update `FRONTEND_URL` in Render as described above

---

## Part 4️⃣: Initialize Database

### Create Admin User
1. Go to your Render backend logs
2. Find the **Shell** tab or use the web service URL
3. Run the admin creation script by accessing:
   ```
   https://your-backend-url.onrender.com/api/admin/setup
   ```
   OR run via Render shell:
   ```bash
   node create-admin.js
   ```

### Seed Sample Data (Optional)
Access via Render shell:
```bash
node seed-pan-service.js
```

---

## 🎉 Testing Your Deployment

1. **Visit your frontend URL** (Vercel or Netlify)
2. **Test user registration** and login
3. **Login as admin** (if you created admin user)
4. **Test file uploads** and form submissions

---

## 📊 Free Tier Limitations

### MongoDB Atlas Free Tier:
- ✅ 512 MB storage
- ✅ Shared RAM
- ✅ No credit card required

### Render Free Tier:
- ✅ 750 hours/month
- ✅ 512 MB RAM
- ⚠️ Sleeps after 15 min inactivity
- ⚠️ 100 GB bandwidth/month

### Vercel Free Tier:
- ✅ 100 GB bandwidth/month
- ✅ Unlimited sites
- ✅ Automatic SSL
- ✅ No sleep time

### Netlify Free Tier:
- ✅ 100 GB bandwidth/month
- ✅ 300 build minutes/month
- ✅ Automatic SSL
- ✅ No sleep time

---

## 🔧 Troubleshooting

### Backend won't start:
- Check environment variables are set correctly in Render
- Verify MongoDB connection string is correct
- Check Render logs for errors

### Frontend can't connect to backend:
- Verify API URL in `environment.prod.ts`
- Check CORS settings (FRONTEND_URL) in Render
- Ensure Render service is running (may need to wake from sleep)

### Database connection fails:
- Verify MongoDB Atlas IP whitelist includes 0.0.0.0/0
- Check database user credentials
- Ensure connection string includes database name

### File uploads not working:
- Render free tier has ephemeral storage
- Files are deleted on restart
- Consider using cloud storage (Cloudinary, AWS S3 free tier) for production

---

## 🔐 Security Recommendations

1. **Never commit `.env` files** to GitHub
2. **Use strong JWT_SECRET** (minimum 32 random characters)
3. **Change default admin credentials** after first login
4. **Enable 2FA** on MongoDB Atlas, Render, and Vercel/Netlify accounts
5. **Regularly update dependencies**: `npm audit fix`

---

## 📝 Post-Deployment Checklist

- [ ] MongoDB Atlas cluster created and accessible
- [ ] Backend deployed on Render
- [ ] Frontend deployed on Vercel/Netlify
- [ ] Environment variables configured
- [ ] CORS settings updated
- [ ] Admin user created
- [ ] Test registration and login
- [ ] Test all major features
- [ ] Custom domain configured (optional)

---

## 🌐 Optional: Custom Domain

### For Vercel:
1. Go to Project Settings → Domains
2. Add your domain
3. Configure DNS records as shown

### For Render:
1. Go to Settings → Custom Domain
2. Add your domain
3. Configure DNS records as shown

---

## 💡 Cost-Free Alternatives

If you hit free tier limits, consider:

- **Railway** (another free backend hosting)
- **Cyclic** (free Node.js hosting)
- **PlanetScale** (free MySQL database)
- **Supabase** (free PostgreSQL database)
- **Cloudflare Pages** (free frontend hosting)

---

## 🎊 Congratulations!

Your Digital Government Service Consultancy application is now live and accessible worldwide for free!

**Need help?** Check the logs in Render dashboard or browser console for errors.

---

## Quick Reference URLs

- **MongoDB Atlas**: https://cloud.mongodb.com
- **Render Dashboard**: https://dashboard.render.com
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Netlify Dashboard**: https://app.netlify.com
- **Your Backend**: https://[your-app].onrender.com
- **Your Frontend**: https://[your-app].vercel.app or .netlify.app
