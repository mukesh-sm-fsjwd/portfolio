# GitHub Setup Guide

Complete guide to upload your portfolio to GitHub.

## 📚 What is Git & GitHub?

**Git** = Version control system (tracks code changes)  
**GitHub** = Website to store your code online

Think of it like Google Drive, but for code!

---

## 🔧 Step 1: Install Git

### Windows:
1. Download from [git-scm.com](https://git-scm.com)
2. Run installer
3. Keep default settings
4. Click "Next" → "Install"

### Verify Installation:
```bash
git --version
```
Should show: `git version 2.x.x`

---

## 👤 Step 2: Configure Git

Open PowerShell and run:

```bash
git config --global user.name "mukesh-sm-fsjwd"
git config --global user.email "smmukesh.ai369@gmail.com"
```

**Use the same email as your GitHub account!**

---

## 🌐 Step 3: Create GitHub Account

1. Go to [github.com](https://github.com)
2. Click "Sign up"
3. Enter email, password, username
4. Verify email

---

## 📁 Step 4: Create .gitignore File

This tells Git what NOT to upload.

**Already created for you!** Check `.gitignore` file.

**Important files to ignore:**
- `.env` (contains secrets!)
- `node_modules/` (too large)
- `uploads/` (user files)
- `.DS_Store` (Mac files)

---

## 🚀 Step 5: Upload to GitHub

### A. Initialize Git (First Time Only)

Open PowerShell in your project folder:

```bash
cd C:\Users\devid\Desktop\portfolio
git init
```

### B. Add Files

```bash
git add .
```

This stages all files for commit.

### C. Commit Files

```bash
git commit -m "Initial commit: Portfolio website"
```

This saves a snapshot of your code.

### D. Create GitHub Repository

1. Go to [github.com](https://github.com)
2. Click "+" → "New repository"
3. Name: `portfolio`
4. Description: "My professional portfolio website"
5. Keep it **Public** (so recruiters can see)
6. **DON'T** check "Initialize with README" (we already have one)
7. Click "Create repository"

### E. Connect to GitHub

Copy the commands from GitHub (they'll look like this):

```bash
git remote add origin https://github.com/YOUR_USERNAME/portfolio.git
git branch -M main
git push -u origin main
```

**Enter your GitHub username and password when prompted.**

---

## 🔄 Step 6: Update Code Later

When you make changes:

```bash
# 1. Add changes
git add .

# 2. Commit with message
git commit -m "Updated projects section"

# 3. Push to GitHub
git push
```

**That's it!** Your changes are now on GitHub.

---

## 📝 What to Commit vs. What NOT to Commit

### ✅ DO Commit:
- All code files (`.js`, `.html`, `.css`)
- README.md
- package.json
- .gitignore
- Public images/assets

### ❌ DON'T Commit:
- `.env` file (SECRETS!)
- `node_modules/` folder
- `uploads/` folder (user data)
- Database files
- Personal information
- Passwords

---

## 🔒 Security: Protecting Your Secrets

### Your `.env` file contains:
- Database password
- Session secret
- API keys

**NEVER commit this file!**

### How to Keep It Safe:

1. **Check .gitignore**
   ```bash
   # Make sure .env is listed
   cat .gitignore | findstr .env
   ```

2. **If you accidentally committed .env:**
   ```bash
   git rm --cached .env
   git commit -m "Remove .env from tracking"
   git push
   ```

3. **Change all passwords immediately!**

---

## 📂 Repository Structure

Your GitHub repo will look like:

```
portfolio/
├── css/
├── js/
├── index.html
├── admin.html
├── server.js
├── package.json
├── README.md
├── DEPLOYMENT.md
├── GITHUB_GUIDE.md
└── .gitignore
```

**Note:** `uploads/`, `node_modules/`, `.env` won't be there (ignored!)

---

## 🎯 Best Practices

### Commit Messages:
- ✅ "Added contact form validation"
- ✅ "Fixed mobile responsive issues"
- ✅ "Updated skills section"
- ❌ "asdf"
- ❌ "changes"
- ❌ "update"

### When to Commit:
- After completing a feature
- After fixing a bug
- Before trying something risky
- At end of work session

### Commit Often!
- Small commits are better
- Easier to track changes
- Easier to undo mistakes

---

## 🌟 Make Your Repo Look Professional

### 1. Add a Good README
✅ Already done! See `README.md`

### 2. Add Topics
On GitHub repo page:
- Click "⚙️" next to "About"
- Add topics: `portfolio`, `java`, `spring-boot`, `javascript`, `mysql`

### 3. Add Description
"Professional portfolio website built with Java Spring Boot and vanilla JavaScript"

### 4. Pin Repository
On your GitHub profile:
- Go to "Repositories"
- Click "Customize your pins"
- Select your portfolio

---

## 🔧 Common Git Commands

```bash
# Check status
git status

# See commit history
git log

# See changes
git diff

# Undo changes (before commit)
git checkout -- filename

# Undo last commit (keep changes)
git reset --soft HEAD~1

# Update from GitHub
git pull

# Create new branch
git checkout -b feature-name

# Switch branch
git checkout main
```

---

## ❓ Troubleshooting

### "Permission denied"
- Check GitHub username/password
- Use Personal Access Token instead of password
- Go to GitHub → Settings → Developer settings → Personal access tokens

### "Repository not found"
- Check repository URL
- Make sure repo exists on GitHub
- Check spelling

### "Merge conflict"
- Don't panic!
- Open conflicted file
- Choose which changes to keep
- Commit the resolution

### "Large files"
- Check .gitignore
- Remove large files
- Use Git LFS for large files

---

## 📱 GitHub Mobile App

Download GitHub app:
- View your repos
- Check commits
- Respond to issues
- Track stars/forks

---

## 🎓 Learning Resources

- [GitHub Guides](https://guides.github.com)
- [Git Handbook](https://guides.github.com/introduction/git-handbook/)
- [GitHub Learning Lab](https://lab.github.com)

---

## ✅ Checklist Before Pushing

- [ ] `.env` is in `.gitignore`
- [ ] No passwords in code
- [ ] README.md is complete
- [ ] Code is tested
- [ ] Commit message is clear
- [ ] No sensitive data

---

## 🎉 You're Done!

Your code is now on GitHub!

**Share your repo:**
- Add to LinkedIn
- Add to resume
- Share with recruiters
- Show to friends

**Your repo URL:**
`https://github.com/YOUR_USERNAME/portfolio`

---

**Next Step:** See `DEPLOYMENT.md` to host your website!

**Good luck! 🚀**
