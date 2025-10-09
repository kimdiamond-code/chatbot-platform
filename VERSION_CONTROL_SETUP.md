# VERSION CONTROL SETUP GUIDE

## THE PROBLEM
Your project has NO git repository, causing:
- Random file reversions from OneDrive sync
- No change tracking
- Manual deployment errors
- Loss of previous fixes

## THE SOLUTION - 3 Steps

### STEP 1: Initialize Git Repository (Run these commands ONE AT A TIME)

```bash
cd "C:\Users\kdiamond\OneDrive - True Citrus\Directory\Chatbot\Chatbot set up\Chatbot-platform_files\chatbot-platform"
git init
git add .
git commit -m "Initial commit - Version 2.0.8 baseline"
```

### STEP 2: Create GitHub Repository & Push

1. Go to https://github.com/new
2. Create new repository named `chatbot-platform`
3. DO NOT initialize with README
4. Copy the repository URL (should look like: https://github.com/YOUR_USERNAME/chatbot-platform.git)

Run these commands:
```bash
git branch -M main
git remote add origin YOUR_GITHUB_URL_HERE
git push -u origin main
```

### STEP 3: Connect Vercel to GitHub (CRITICAL)

1. Go to https://vercel.com/dashboard
2. Find your project: `chatbot-platform-v2`
3. Go to Settings → Git
4. Click "Connect Git Repository"
5. Select your GitHub repo: `chatbot-platform`
6. Save

**FROM NOW ON**: Vercel will auto-deploy when you push to GitHub

---

## DAILY WORKFLOW (After Setup)

### Making Changes:
```bash
# 1. Make your code changes
# 2. Save files
# 3. Commit changes
git add .
git commit -m "Brief description of changes"
git push
```

**Vercel will automatically deploy within 2-3 minutes**

### Before Making Changes:
```bash
# Always pull latest first
git pull
```

### Check Current Status:
```bash
git status
```

---

## EMERGENCY RECOVERY

If files revert again, restore from Git:
```bash
git checkout main
git pull
```

---

## VERSION TRACKING

Update VERSION file with each major change:
```bash
echo "2.0.9" > VERSION
git add VERSION
git commit -m "Bump version to 2.0.9"
git push
```

---

## IMPORTANT NOTES

1. **NEVER delete the .git folder** - that's your entire history
2. **Always commit before major changes** - creates restore points
3. **OneDrive is now just a backup** - Git is the source of truth
4. **Vercel deploys from GitHub** - not from your local files
5. **Keep .env files local** - already in .gitignore for security
