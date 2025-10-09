# DAILY DEVELOPMENT WORKFLOW

## ⚠️ CRITICAL: Run This ONCE (First Time Setup)

**Open Command Prompt and run these commands ONE AT A TIME:**

```bash
cd "C:\Users\kdiamond\OneDrive - True Citrus\Directory\Chatbot\Chatbot set up\Chatbot-platform_files\chatbot-platform"

git init

git add .

git commit -m "Version 2.0.8 - Baseline commit"
```

**Then follow VERSION_CONTROL_SETUP.md to connect to GitHub and Vercel**

---

## ✅ EVERY TIME You Work on the Project

### BEFORE Making Changes:
```bash
cd "C:\Users\kdiamond\OneDrive - True Citrus\Directory\Chatbot\Chatbot set up\Chatbot-platform_files\chatbot-platform"
git pull
```

### AFTER Making Changes:
```bash
git status
git add .
git commit -m "Description of what you changed"
git push
```

**Vercel auto-deploys in 2-3 minutes after push**

---

## 🚨 If Files Revert (Emergency Recovery)

```bash
git checkout main
git reset --hard origin/main
git pull
```

This restores the last committed version from GitHub.

---

## 📝 Quick Commands Reference

| Command | What It Does |
|---------|-------------|
| `git status` | Show what files changed |
| `git pull` | Get latest version from GitHub |
| `git add .` | Stage all changes for commit |
| `git commit -m "message"` | Save changes locally with description |
| `git push` | Upload changes to GitHub (triggers Vercel deploy) |
| `git log --oneline` | Show recent commits |
| `git diff` | Show what changed in files |

---

## 🎯 Version Numbering

When you make significant changes, update VERSION file:

```bash
echo 2.0.9 > VERSION
git add VERSION
git commit -m "Bump version to 2.0.9"
git push
```

**Version Format:**
- `2.0.x` - Minor fixes/features
- `2.x.0` - New features
- `x.0.0` - Major overhaul

---

## 🔍 Pre-Deployment Safety Check

Before any deployment, run:
```bash
PRE_DEPLOY_CHECK.bat
```

This checks:
- Git is initialized
- All changes are committed
- Remote GitHub connection
- Current version

---

## 🆘 Common Issues

### Issue: "Git not recognized"
**Fix:** Install Git from https://git-scm.com/download/win

### Issue: Files still reverting
**Fix:** Make sure you're committing AND pushing:
```bash
git add .
git commit -m "fix"
git push
```

### Issue: Merge conflicts
**Fix:** 
```bash
git stash
git pull
git stash pop
```

### Issue: Vercel not auto-deploying
**Fix:** Check Vercel Settings → Git → ensure GitHub repo is connected

---

## 📋 Checklist for Each Work Session

- [ ] `git pull` before starting
- [ ] Make code changes
- [ ] Test locally
- [ ] `git add .`
- [ ] `git commit -m "description"`
- [ ] `git push`
- [ ] Wait 3 mins for Vercel deployment
- [ ] Test production site

---

## 💡 Pro Tips

1. **Commit often** - Small commits are easier to track and revert
2. **Write clear commit messages** - "Fixed analytics bug" not "updates"
3. **Always pull before starting** - Prevents conflicts
4. **Check git status regularly** - Know what's changed
5. **Keep .env files updated locally** - They're not in Git for security

---

## 🔗 Links You'll Need

- GitHub: https://github.com
- Vercel Dashboard: https://vercel.com/dashboard
- Git Documentation: https://git-scm.com/doc
- Your Project: (will be) https://github.com/YOUR_USERNAME/chatbot-platform
