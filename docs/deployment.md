# BobForge Deployment Guide

## Overview

This guide provides step-by-step instructions for deploying BobForge to production. The recommended setup is:
- **Frontend**: Vercel (static hosting with CDN)
- **Backend**: Render (Node.js hosting)

---

## Prerequisites

Before deploying, ensure you have:
- [ ] GitHub account
- [ ] Vercel account (sign up at vercel.com)
- [ ] Render account (sign up at render.com)
- [ ] Code pushed to GitHub repository
- [ ] No secrets committed to repository

---

## Part 1: Backend Deployment (Render)

### Step 1: Prepare Backend for Deployment

1. **Verify package.json has correct start script**:
   ```json
   {
     "scripts": {
       "start": "node src/server.js"
     }
   }
   ```

2. **Verify environment variables are documented** in `backend/.env.example`

3. **Test locally**:
   ```bash
   cd backend
   npm install
   npm start
   ```

### Step 2: Create Render Web Service

1. **Go to Render Dashboard**: https://dashboard.render.com

2. **Click "New +" → "Web Service"**

3. **Connect GitHub Repository**:
   - Select your BobForge repository
   - Grant Render access if prompted

4. **Configure Web Service**:
   ```
   Name: bobforge-backend (or your preferred name)
   Region: Choose closest to your users
   Branch: main
   Root Directory: backend
   Runtime: Node
   Build Command: npm install
   Start Command: npm start
   ```

5. **Select Plan**:
   - Free tier is sufficient for demo/hackathon
   - Upgrade to paid plan for production use

6. **Add Environment Variables**:
   Click "Advanced" → "Add Environment Variable"
   
   ```
   PORT=3001
   NODE_ENV=production
   CORS_ORIGIN=https://your-frontend-url.vercel.app
   DATA_DIR=./src/data
   APP_NAME=BobForge
   APP_VERSION=1.0.0
   ```
   
   **Important**: Leave `CORS_ORIGIN` empty for now. You'll update it after deploying the frontend.

7. **Click "Create Web Service"**

8. **Wait for Deployment**:
   - Render will build and deploy your backend
   - This takes 2-5 minutes
   - Watch the logs for any errors

9. **Note Your Backend URL**:
   - After deployment, you'll see a URL like: `https://bobforge-backend.onrender.com`
   - Save this URL - you'll need it for frontend deployment

10. **Test Backend**:
    ```bash
    curl https://bobforge-backend.onrender.com/api/health
    ```
    
    Expected response:
    ```json
    {
      "status": "ok",
      "timestamp": "...",
      "service": "BobForge Backend",
      "version": "1.0.0"
    }
    ```

### Step 3: Configure Auto-Deploy (Optional)

Render automatically deploys when you push to your main branch. To configure:

1. Go to your service settings
2. Under "Build & Deploy" → "Auto-Deploy"
3. Ensure "Auto-Deploy" is enabled

---

## Part 2: Frontend Deployment (Vercel)

### Step 1: Prepare Frontend for Deployment

1. **Create production environment file**:
   
   Create `frontend/.env.production`:
   ```env
   VITE_API_BASE_URL=https://bobforge-backend.onrender.com
   ```
   
   Replace with your actual Render backend URL.

2. **Test build locally**:
   ```bash
   cd frontend
   npm install
   npm run build
   npm run preview
   ```

3. **Verify build output**:
   - Check `frontend/dist/` directory exists
   - Test the preview at `http://localhost:4173`

### Step 2: Deploy to Vercel

#### Option A: Deploy via Vercel CLI (Recommended)

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy from frontend directory**:
   ```bash
   cd frontend
   vercel
   ```

4. **Follow prompts**:
   ```
   ? Set up and deploy "~/bobforge/frontend"? Y
   ? Which scope? [Your account]
   ? Link to existing project? N
   ? What's your project's name? bobforge
   ? In which directory is your code located? ./
   ? Want to override the settings? N
   ```

5. **Deploy to production**:
   ```bash
   vercel --prod
   ```

#### Option B: Deploy via Vercel Dashboard

1. **Go to Vercel Dashboard**: https://vercel.com/dashboard

2. **Click "Add New..." → "Project"**

3. **Import Git Repository**:
   - Select your BobForge repository
   - Click "Import"

4. **Configure Project**:
   ```
   Framework Preset: Vite
   Root Directory: frontend
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   ```

5. **Add Environment Variables**:
   ```
   VITE_API_BASE_URL=https://bobforge-backend.onrender.com
   ```
   
   Replace with your actual Render backend URL.

6. **Click "Deploy"**

7. **Wait for Deployment**:
   - Vercel will build and deploy your frontend
   - This takes 1-3 minutes
   - Watch the logs for any errors

8. **Note Your Frontend URL**:
   - After deployment, you'll see a URL like: `https://bobforge.vercel.app`
   - This is your production URL

### Step 3: Update Backend CORS

Now that you have your frontend URL, update the backend:

1. **Go to Render Dashboard** → Your backend service

2. **Go to "Environment"**

3. **Update `CORS_ORIGIN`**:
   ```
   CORS_ORIGIN=https://bobforge.vercel.app
   ```
   
   Or for multiple origins:
   ```
   CORS_ORIGIN=https://bobforge.vercel.app,https://bobforge-preview.vercel.app
   ```

4. **Click "Save Changes"**

5. **Render will automatically redeploy** with new CORS settings

### Step 4: Test Production Deployment

1. **Visit your frontend URL**: `https://bobforge.vercel.app`

2. **Test key features**:
   - [ ] Homepage loads
   - [ ] Can enter an idea
   - [ ] Blueprint generation works
   - [ ] Can view generated blueprint
   - [ ] Export functionality works
   - [ ] Bob prompt page loads
   - [ ] Evidence page loads

3. **Check browser console** for any errors

4. **Test API connection**:
   - Open browser DevTools → Network tab
   - Generate a blueprint
   - Verify API calls to your Render backend succeed

---

## Part 3: Custom Domain (Optional)

### For Frontend (Vercel)

1. **Go to Vercel Dashboard** → Your project → "Settings" → "Domains"

2. **Add your domain**:
   ```
   bobforge.com
   www.bobforge.com
   ```

3. **Configure DNS**:
   - Add CNAME record pointing to `cname.vercel-dns.com`
   - Or follow Vercel's specific instructions

4. **Wait for DNS propagation** (can take up to 48 hours)

### For Backend (Render)

1. **Go to Render Dashboard** → Your service → "Settings" → "Custom Domain"

2. **Add your domain**:
   ```
   api.bobforge.com
   ```

3. **Configure DNS**:
   - Add CNAME record pointing to your Render service
   - Follow Render's specific instructions

4. **Update frontend environment variable**:
   ```
   VITE_API_BASE_URL=https://api.bobforge.com
   ```

---

## Part 4: Environment Variables Reference

### Backend Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | `3001` | Server port |
| `NODE_ENV` | No | `development` | Environment mode |
| `CORS_ORIGIN` | Yes | - | Allowed frontend origins (comma-separated) |
| `DATA_DIR` | No | `./src/data` | Data storage directory |
| `APP_NAME` | No | `BobForge` | Application name |
| `APP_VERSION` | No | `1.0.0` | Application version |

### Frontend Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `VITE_API_BASE_URL` | Yes | - | Backend API URL |

---

## Part 5: Monitoring & Maintenance

### Render Monitoring

1. **View Logs**:
   - Go to your service → "Logs"
   - Monitor for errors and performance issues

2. **Set up Alerts** (Paid plans):
   - Configure email alerts for service downtime
   - Set up Slack notifications

3. **Monitor Metrics**:
   - CPU usage
   - Memory usage
   - Request count
   - Response times

### Vercel Monitoring

1. **View Deployment Logs**:
   - Go to your project → "Deployments"
   - Click on a deployment to view logs

2. **Analytics** (Pro plan):
   - Page views
   - Unique visitors
   - Performance metrics

3. **Error Tracking**:
   - Integrate with Sentry or similar service
   - Monitor client-side errors

### Health Checks

Set up automated health checks:

**Backend Health Check**:
```bash
curl https://bobforge-backend.onrender.com/api/health
```

**Frontend Health Check**:
```bash
curl -I https://bobforge.vercel.app
```

Use services like:
- UptimeRobot (free)
- Pingdom
- StatusCake

---

## Part 6: Troubleshooting

### Common Issues

#### Backend Issues

**Issue**: Backend not starting
- **Check**: Render logs for errors
- **Verify**: `package.json` has correct start script
- **Verify**: All dependencies are in `dependencies` (not `devDependencies`)

**Issue**: CORS errors
- **Check**: `CORS_ORIGIN` environment variable is set correctly
- **Verify**: Frontend URL matches exactly (including https://)
- **Try**: Add multiple origins separated by commas

**Issue**: 404 errors on API calls
- **Check**: API routes are correct
- **Verify**: Backend is running and accessible
- **Test**: Health endpoint directly

#### Frontend Issues

**Issue**: Blank page after deployment
- **Check**: Browser console for errors
- **Verify**: `VITE_API_BASE_URL` is set correctly
- **Verify**: Build completed successfully

**Issue**: API calls failing
- **Check**: Network tab in browser DevTools
- **Verify**: Backend URL is correct and accessible
- **Verify**: CORS is configured on backend

**Issue**: Environment variables not working
- **Verify**: Variables start with `VITE_`
- **Redeploy**: After changing environment variables
- **Check**: Build logs for variable values

### Debug Mode

**Enable verbose logging on backend**:

Add to Render environment variables:
```
DEBUG=*
LOG_LEVEL=debug
```

**Check frontend build**:
```bash
cd frontend
npm run build
# Check dist/ directory
ls -la dist/
```

---

## Part 7: Rollback Procedure

### Rollback Backend (Render)

1. Go to your service → "Deploys"
2. Find the last working deployment
3. Click "..." → "Redeploy"

### Rollback Frontend (Vercel)

1. Go to your project → "Deployments"
2. Find the last working deployment
3. Click "..." → "Promote to Production"

---

## Part 8: CI/CD Setup (Optional)

### GitHub Actions for Backend

Create `.github/workflows/backend-deploy.yml`:

```yaml
name: Deploy Backend

on:
  push:
    branches: [main]
    paths:
      - 'backend/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Render
        run: |
          curl -X POST ${{ secrets.RENDER_DEPLOY_HOOK }}
```

### GitHub Actions for Frontend

Vercel automatically deploys on push to main branch.

To customize, create `.github/workflows/frontend-deploy.yml`:

```yaml
name: Deploy Frontend

on:
  push:
    branches: [main]
    paths:
      - 'frontend/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
          working-directory: ./frontend
```

---

## Part 9: Security Checklist

Before going to production:

- [ ] All secrets in environment variables (not in code)
- [ ] `.env` files in `.gitignore`
- [ ] CORS configured with specific origins (not `*`)
- [ ] HTTPS enabled (automatic on Vercel and Render)
- [ ] Input validation on all endpoints
- [ ] Rate limiting configured (if needed)
- [ ] Error messages don't expose sensitive data
- [ ] Dependencies updated and scanned for vulnerabilities

---

## Part 10: Performance Optimization

### Backend Optimization

1. **Enable compression**:
   ```bash
   npm install compression
   ```
   
   Add to `backend/src/app.js`:
   ```javascript
   const compression = require('compression');
   app.use(compression());
   ```

2. **Add caching headers** for static exports

3. **Monitor response times** and optimize slow endpoints

### Frontend Optimization

1. **Code splitting** (already enabled with Vite)

2. **Image optimization**:
   - Use WebP format
   - Lazy load images
   - Use CDN for assets

3. **Bundle analysis**:
   ```bash
   npm run build -- --mode analyze
   ```

---

## Quick Reference

### Deployment URLs

**Production**:
- Frontend: `https://bobforge.vercel.app`
- Backend: `https://bobforge-backend.onrender.com`
- Health Check: `https://bobforge-backend.onrender.com/api/health`

**Development**:
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3001`

### Useful Commands

```bash
# Backend
cd backend
npm install
npm start                 # Production
npm run dev              # Development
npm test                 # Run tests

# Frontend
cd frontend
npm install
npm run dev              # Development
npm run build            # Build for production
npm run preview          # Preview production build

# Deployment
vercel                   # Deploy to Vercel preview
vercel --prod            # Deploy to Vercel production
```

---

## Support

For deployment issues:
- **Render**: https://render.com/docs
- **Vercel**: https://vercel.com/docs
- **BobForge**: Create an issue on GitHub

---

**Last Updated**: May 16, 2026  
**Version**: 1.0.0  
**Maintained By**: BobForge Team