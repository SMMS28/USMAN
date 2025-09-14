# 🚀 Deploy to Railway (FREE)

## Step 1: Create Railway Account
1. Go to [railway.app](https://railway.app)
2. Click "Login" and sign up with GitHub
3. Connect your GitHub account

## Step 2: Deploy Your App
1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Choose your USMAN repository
4. Railway will automatically detect it's a Node.js app

## Step 3: Configure Environment Variables
In Railway dashboard, go to your project → Variables tab:
- `NODE_ENV` = `production`
- `JWT_SECRET` = `your-super-secret-key-here`
- `PORT` = `5001` (Railway will set this automatically)

## Step 4: Deploy
1. Railway will automatically build and deploy
2. Your app will be live at: `https://your-app-name.railway.app`

## ✅ What Works on Railway:
- ✅ SQLite database (persistent storage)
- ✅ Socket.io real-time features
- ✅ File uploads
- ✅ All your current features

## 🎉 You're Done!
Your SkillSwap app will be live on the internet for FREE!

---

## Alternative: Deploy via CLI
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Deploy
railway up
```
