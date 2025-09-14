# 🚀 Deploy SkillSwap to the Internet (FREE)

## Option 1: Vercel (Recommended - Easiest)

### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

### Step 2: Login to Vercel
```bash
vercel login
```

### Step 3: Deploy
```bash
vercel
```

### Step 4: Follow the prompts:
- Set up and deploy? **Yes**
- Which scope? **Your account**
- Link to existing project? **No**
- Project name: **skillswap-app** (or any name you like)
- Directory: **./** (current directory)
- Override settings? **No**

### Step 5: Your app will be live at:
`https://skillswap-app-xxx.vercel.app`

---

## Option 2: Netlify

### Step 1: Install Netlify CLI
```bash
npm install -g netlify-cli
```

### Step 2: Login
```bash
netlify login
```

### Step 3: Deploy
```bash
netlify deploy --prod --dir=client/build
```

---

## Option 3: Railway (For Full-Stack)

### Step 1: Go to [railway.app](https://railway.app)
### Step 2: Connect your GitHub repository
### Step 3: Railway will auto-detect and deploy

---

## Important Notes:

### Database Issue:
- **SQLite won't work on Vercel/Netlify** (file system not persistent)
- **Solutions:**
  1. Use **Railway** (supports SQLite)
  2. Upgrade to **PostgreSQL** (free on Railway/Heroku)
  3. Use **MongoDB Atlas** (free tier)

### Environment Variables:
Set these in your hosting platform:
- `JWT_SECRET`: Any random string
- `NODE_ENV`: production

### Quick Fix for Database:
Replace SQLite with a cloud database or use Railway for hosting.

---

## 🎉 After Deployment:
Your app will be live on the internet and accessible to anyone!
