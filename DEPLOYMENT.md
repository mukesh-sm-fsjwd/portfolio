# Deployment Guide

Complete guide to deploy your portfolio website to production.

## 🚀 Quick Deploy Options

### Option 1: Render (Recommended - FREE)

**Why Render?**
- ✅ Free tier available
- ✅ Easy deployment from GitHub
- ✅ Automatic HTTPS
- ✅ MySQL database included
- ✅ No credit card required

**Steps:**

1. **Prepare Your Code**
   ```bash
   # Make sure .gitignore is set up
   # Make sure .env is NOT committed
   ```

2. **Push to GitHub** (See GITHUB_GUIDE.md)

3. **Create Render Account**
   - Go to [render.com](https://render.com)
   - Sign up with GitHub

4. **Create Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Configure:
     - **Name**: `your-portfolio`
     - **Environment**: `Node`
     - **Build Command**: `npm install`
     - **Start Command**: `node server.js`

5. **Add Environment Variables**
   In Render dashboard, add:
   ```
   DB_HOST=your_mysql_host
   DB_PORT=3306
   DB_NAME=portfolio_db
   DB_USER=your_db_user
   DB_PASSWORD=your_db_password
   SESSION_SECRET=your_strong_secret_here
   NODE_ENV=production
   ```

6. **Create MySQL Database**
   - In Render, create new MySQL database
   - Copy connection details to environment variables

7. **Deploy!**
   - Click "Create Web Service"
   - Wait for deployment (5-10 minutes)
   - Your site will be live at `https://your-portfolio.onrender.com`

---

### Option 2: Railway (Alternative - FREE)

**Steps:**

1. **Create Railway Account**
   - Go to [railway.app](https://railway.app)
   - Sign up with GitHub

2. **New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your portfolio repository

3. **Add MySQL**
   - Click "New" → "Database" → "Add MySQL"
   - Copy connection details

4. **Set Environment Variables**
   - Click on your service
   - Go to "Variables"
   - Add all variables from .env

5. **Deploy**
   - Railway auto-deploys on push
   - Get your URL from dashboard

---

### Option 3: Heroku (Paid)

**Note:** Heroku no longer has a free tier.

**Steps:**

1. **Install Heroku CLI**
   ```bash
   # Download from heroku.com/cli
   ```

2. **Login**
   ```bash
   heroku login
   ```

3. **Create App**
   ```bash
   heroku create your-portfolio-name
   ```

4. **Add MySQL**
   ```bash
   heroku addons:create jawsdb:kitefin
   ```

5. **Set Environment Variables**
   ```bash
   heroku config:set SESSION_SECRET=your_secret
   heroku config:set NODE_ENV=production
   ```

6. **Deploy**
   ```bash
   git push heroku main
   ```

---

## 🔒 Security Checklist

Before deploying, make sure:

### ✅ Environment Variables
- [ ] `.env` file is in `.gitignore`
- [ ] All secrets are in environment variables
- [ ] `SESSION_SECRET` is strong and random
- [ ] Database password is strong

### ✅ Admin Security
- [ ] Changed default admin password
- [ ] Admin username is not "admin"
- [ ] Session timeout is configured

### ✅ Database
- [ ] Database is not publicly accessible
- [ ] Using environment-specific credentials
- [ ] Backups are enabled

### ✅ Code
- [ ] No console.log with sensitive data
- [ ] No hardcoded credentials
- [ ] CORS is properly configured
- [ ] File upload limits are set

---

## 🌐 Custom Domain

### After Deployment:

1. **Buy Domain** (Namecheap, GoDaddy, etc.)

2. **Configure DNS**
   - Add CNAME record:
     - Name: `www`
     - Value: `your-app.onrender.com`
   - Add A record:
     - Name: `@`
     - Value: Your hosting IP

3. **Update Hosting**
   - In Render/Railway dashboard
   - Add custom domain
   - Follow SSL setup instructions

---

## 📊 Post-Deployment

### Monitor Your Site:

1. **Check Logs**
   - Render: Dashboard → Logs
   - Railway: Dashboard → Deployments → Logs

2. **Test Everything**
   - [ ] Homepage loads
   - [ ] Admin panel accessible
   - [ ] Login works
   - [ ] File uploads work
   - [ ] Contact form works
   - [ ] All images load

3. **Set Up Monitoring**
   - Use UptimeRobot (free)
   - Get alerts if site goes down

---

## 🔧 Troubleshooting

### Site Won't Start
- Check logs for errors
- Verify environment variables
- Check database connection

### Database Connection Failed
- Verify DB credentials
- Check if DB is running
- Verify DB host/port

### File Uploads Not Working
- Check upload directory permissions
- Verify file size limits
- Check disk space

### Admin Panel Not Loading
- Clear browser cache
- Check console for errors
- Verify static files are served

---

## 📱 Mobile Testing

After deployment, test on:
- [ ] iPhone (Safari)
- [ ] Android (Chrome)
- [ ] Tablet
- [ ] Different screen sizes

Use Chrome DevTools → Device Toolbar

---

## 🎉 You're Live!

Your portfolio is now accessible worldwide!

**Next Steps:**
1. Share your portfolio URL
2. Add to LinkedIn
3. Add to resume
4. Share on social media

**Maintenance:**
- Update content regularly
- Add new projects
- Keep dependencies updated
- Monitor for security updates

---

**Need Help?**
- Check hosting platform docs
- Search Stack Overflow
- Check GitHub Issues

**Good luck! 🚀**
