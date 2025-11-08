# Step-by-Step Vercel Deployment Guide

## Prerequisites
- A GitHub account
- A Vercel account (free)
- Your code ready to deploy

---

## Step 1: Prepare Your Code for Git (if not already done)

If you haven't initialized git yet:

```bash
# In your project root directory
git init
git add .
git commit -m "Initial commit - ready for deployment"
```

---

## Step 2: Push to GitHub

### Option A: Create a New Repository on GitHub

1. Go to [github.com](https://github.com) and sign in
2. Click the **"+"** icon → **"New repository"**
3. Name it (e.g., `hologram-parallel-universe-explorer`)
4. Choose **Public** or **Private**
5. **Don't** initialize with README, .gitignore, or license (you already have these)
6. Click **"Create repository"**

### Option B: Use Existing Repository

If you already have a GitHub repo, use that.

### Push Your Code

```bash
# Add your GitHub repository as remote (replace with your repo URL)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# Push your code
git branch -M main
git push -u origin main
```

---

## Step 3: Deploy to Vercel

### 3.1 Sign Up / Log In to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click **"Sign Up"** (or **"Log In"** if you have an account)
3. Choose **"Continue with GitHub"** (recommended - easiest integration)
4. Authorize Vercel to access your GitHub account

### 3.2 Import Your Project

1. After logging in, you'll see the Vercel dashboard
2. Click **"Add New..."** → **"Project"**
3. You'll see a list of your GitHub repositories
4. Find and click **"Import"** next to your repository

### 3.3 Configure Project Settings

Vercel should auto-detect your `vercel.json` file, but verify these settings:

**Project Settings:**
- **Framework Preset:** Vite (should auto-detect)
- **Root Directory:** Leave as `.` (root) - the vercel.json handles the paths
- **Build Command:** `npm run build:core && npm run build:web` (from vercel.json)
- **Output Directory:** `apps/playground-web/dist` (from vercel.json)
- **Install Command:** `npm install` (from vercel.json)

**Important:** Make sure these match what's in `vercel.json`:
- ✅ Build Command: `npm run build:core && npm run build:web`
- ✅ Output Directory: `apps/playground-web/dist`
- ✅ Install Command: `npm install`

### 3.4 Environment Variables (if needed)

If your app uses environment variables:
1. Scroll down to **"Environment Variables"**
2. Add any variables your app needs
3. For this project, you likely don't need any unless you added API keys

### 3.5 Deploy!

1. Click **"Deploy"** button
2. Wait for the build to complete (usually 1-3 minutes)
3. You'll see build logs in real-time
4. Once complete, you'll get a live URL like: `https://your-project-name.vercel.app`

---

## Step 4: Verify Deployment

1. Click on your deployment URL
2. Your app should be live! 🎉
3. Test all functionality to make sure everything works

---

## Step 5: Custom Domain (Optional)

If you want to use your own domain:

1. In Vercel dashboard, go to your project
2. Click **"Settings"** → **"Domains"**
3. Enter your domain name
4. Follow Vercel's instructions to configure DNS
5. SSL certificate is automatically provided (free!)

---

## Automatic Deployments

Vercel automatically:
- ✅ Deploys on every push to `main` branch
- ✅ Creates preview deployments for pull requests
- ✅ Provides HTTPS/SSL automatically
- ✅ Handles routing for React apps

---

## Troubleshooting

### Build Fails?

1. **Check build logs** in Vercel dashboard
2. **Common issues:**
   - Missing dependencies → Check `package.json`
   - Build command wrong → Verify `vercel.json`
   - Node version → Vercel uses Node 18+ by default (your project requires >=18)

### App Works Locally But Not on Vercel?

1. Check browser console for errors
2. Verify all assets are loading
3. Check that `vercel.json` rewrites are correct (for React Router if you add it later)

### Need to Update Deployment?

Just push to GitHub:
```bash
git add .
git commit -m "Update app"
git push
```

Vercel automatically redeploys!

---

## Quick Reference

**Your Vercel Dashboard:** https://vercel.com/dashboard

**Project URL:** `https://your-project-name.vercel.app`

**Build Command:** `npm run build:core && npm run build:web`

**Output Directory:** `apps/playground-web/dist`

---

## Next Steps After Deployment

1. ✅ Share your live URL
2. ✅ Test on mobile devices
3. ✅ Set up custom domain (optional)
4. ✅ Monitor performance in Vercel dashboard
5. ✅ Set up analytics (optional)

---

**Need Help?** Check Vercel docs: https://vercel.com/docs

