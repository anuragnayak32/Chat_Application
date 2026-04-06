# Deployment Guide

This guide covers deploying the Chat App to production.

## 1. MongoDB Atlas Setup (Database)

### Create a MongoDB Atlas Account
1. Go to [mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas)
2. Sign up for a free account
3. Create a new project
4. Create a cluster (free tier is fine)
5. Create a database user and note the credentials
6. Configure network access to allow your IP (or 0.0.0.0 for all)
7. Get your connection string: `mongodb+srv://user:password@cluster.mongodb.net/chatapp?retryWrites=true&w=majority`

## 2. Backend Deployment (Render.com)

### Steps
1. **Create Render Account**
   - Go to [render.com](https://render.com)
   - Sign up and connect your GitHub account

2. **Deploy Backend**
   - Click "New +" → "Web Service"
   - Connect your GitHub repo
   - Configure:
     - **Name**: chat-app-backend
     - **Environment**: Node
     - **Build Command**: `cd backend && npm install`
     - **Start Command**: `cd backend && node server.js`
     - **Plan**: Free tier

3. **Set Environment Variables**
   - In Render dashboard, go to your service → Environment
   - Add variables:
     ```
     MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/chatapp?retryWrites=true&w=majority
     NODE_ENV=production
     ```

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Note your backend URL (e.g., `https://chat-app-backend.onrender.com`)

### Important Notes
- Free tier may sleep after 15 minutes of inactivity
- For production, upgrade to paid tier

## 3. Frontend Deployment (Vercel)

### Steps
1. **Create Vercel Account**
   - Go to [vercel.com](https://vercel.com)
   - Sign up and connect your GitHub account

2. **Configure Environment Variables**
   - Before deploying, update `frontend/.env.production`:
     ```
     VITE_API_URL=https://chat-app-backend.onrender.com
     VITE_SOCKET_URL=https://chat-app-backend.onrender.com
     ```

3. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Update environment for production"
   git push origin main
   ```

4. **Deploy on Vercel**
   - In Vercel dashboard, click "Add New..." → "Project"
   - Select your GitHub repo
   - Configure:
     - **Framework**: Vite
     - **Build Command**: `cd frontend && npm run build`
     - **Output Directory**: `frontend/dist`
   - Add environment variables:
     ```
     VITE_API_URL=https://chat-app-backend.onrender.com
     VITE_SOCKET_URL=https://chat-app-backend.onrender.com
     ```
   - Click "Deploy"

5. **After Deployment**
   - Vercel gives you a URL (e.g., `https://chat-app.vercel.app`)
   - Test the app in production

## 4. Alternative: Deploy Both to Railway

Railway simplifies deployment of full-stack apps.

1. Go to [railway.app](https://railway.app)
2. Connect GitHub
3. Create new project
4. Add services:
   - MongoDB (managed by Railway)
   - Node.js backend
   - Next.js/Vite frontend
5. Set environment variables
6. Deploy

## 5. Troubleshooting Deployments

### "CORS error" in browser
- Ensure backend has correct `FRONTEND_URL` in CORS config
- Check `socket.js` and `api.js` use correct deployed URLs

### "Cannot connect to MongoDB"
- Verify IP whitelist in MongoDB Atlas (0.0.0.0 for all)
- Check connection string in backend `.env`
- Ensure MONGO_URI has correct password (URL encode special chars)

### "Socket.io connection fails"
- Verify both URLs in `socket.js` point to deployed backend
- Check backend logs for connection errors

### "Messages not saving"
- Check MongoDB connection in backend logs
- Verify database user has write permissions

## 6. Monitoring & Logs

### View Backend Logs (Render)
- Dashboard → Service → Logs tab

### View Frontend Logs (Vercel)
- Dashboard → Project → Deployments → Logs

### Database Monitoring (MongoDB Atlas)
- Atlas Dashboard → Metrics → Performance Advisor

## 7. CI/CD Best Practices

Configure GitHub Actions for automatic deployment:

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: cd backend && npm install
      - run: cd frontend && npm install && npm run build
      # Deploy steps here
```

## 8. Cost Estimates (Free Tier)

| Service | Free Tier | Limitation |
|---------|-----------|------------|
| MongoDB Atlas | 512 MB | Good for development |
| Render | Free dyno | Sleeps after 15 min |
| Vercel | Free | 100 GB bandwidth/month |
| **Total** | **Free** | Suitable for hobby projects |

Upgrade to Pro when you have real users.

## 9. Performance Optimization

Before going live:

1. **Build frontend optimized**
   ```bash
   npm run build  # Creates dist/ with minified code
   ```

2. **Add caching headers** to static assets

3. **Enable gzip compression** on backend

4. **Monitor bundle size**
   ```bash
   npm run build -- --analyze
   ```

5. **Set up monitoring/alerting** for errors

## 10. Security Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Use strong MongoDB credentials
- [ ] Enable HTTPS (automatic on Render/Vercel)
- [ ] Set CORS to specific domain, not `*`
- [ ] Add rate limiting to API (future improvement)
- [ ] Use environment variables, never hardcode secrets
- [ ] Keep dependencies updated

---

**That's it!** Your app should now be live. Share the Vercel URL with users.
