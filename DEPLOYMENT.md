# Complete DigitalOcean Deployment Guide

**Follow this guide step-by-step tomorrow morning. Everything you need is here!**

---

## 📋 BEFORE YOU START - Checklist

**Tomorrow Morning (9 AM onwards):**

- [ ] Call Bank of Baroda: 1800 258 4455
- [ ] Enable international transactions on debit card
- [ ] Wait 30 minutes for activation
- [ ] Have your debit card ready
- [ ] Have GitHub account open
- [ ] Have this guide open

**Estimated Time:** 2-3 hours total

---

## PART 1: Enable Your Debit Card (9:00 AM)

### Step 1: Call Bank of Baroda

**Number:** 1800 258 4455 (toll-free)

**What to say:**
```
"Hello, I want to enable international transactions on my debit card.
I need to make an online payment to DigitalOcean in USA.
Please enable international usage for $10 USD."
```

**They will ask:**
1. Your card number (16 digits)
2. Expiry date
3. CVV (3 digits on back)
4. OTP sent to your mobile
5. Your name and account details

**Tell them:**
- "I need it for educational purposes"
- "It's for GitHub Student Developer Pack"
- "Please enable for online transactions"

**Wait:** 15-30 minutes for activation

---

## PART 2: Get Free Domain from Namecheap (9:30 AM)

### Step 1: Access Namecheap for Education

1. **Go to:** https://education.github.com/pack
2. **Find:** "Namecheap" in the list
3. **Click:** "Get access" button
4. **You'll be redirected to:** Namecheap for Education

### Step 2: Register Your Domain

**You're already on this page! Here's what to do:**

1. **"Choose a free option"** section:
   - ✅ Select: **"GitHub Pages"** (this is just a formality, ignore it)
   - This is required but you won't actually use GitHub Pages

2. **"Which domain should receive the free option?"**
   - Already filled: `smmukesh.me` ✅
   - Keep it as is!

3. **"Student email"** section:
   - Enter your college email
   - Example: `yourname@college.edu.in`

4. **Click:** "Confirm Order" or "Complete Order"

5. **Verify email:**
   - Check your college email inbox
   - Click verification link
   - Domain is now yours!

### What is GitHub Pages?

**Don't worry about it!** It's just a checkbox Namecheap requires. You won't use GitHub Pages. You'll use DigitalOcean instead.

**GitHub Pages** = Free hosting for static sites (HTML only, no backend)
**Your site** = Dynamic site with Node.js backend

**So you'll:**
- ✅ Register domain through "GitHub Pages" option (just to get it free)
- ✅ Actually use domain with DigitalOcean (your real hosting)

**It's just Namecheap's way of organizing student benefits!**

---

## PART 3: Claim DigitalOcean Credit (10:00 AM)

### Step 1: Get DigitalOcean Access

1. **Go to:** https://education.github.com/pack
2. **Find:** "DigitalOcean"
3. **Click:** "Get access"
4. **Sign up** with GitHub
5. **$200 credit** applied automatically!

### Step 2: Add Payment Method

1. **Go to:** https://cloud.digitalocean.com
2. **Click:** "Billing" → "Payment Methods"
3. **Click:** "Add Payment Method"
4. **Enter your Bank of Baroda debit card:**
   - Card number: 16 digits
   - Expiry: MM/YY
   - CVV: 3 digits
   - Name: As on card
   - Billing address: Your address

5. **Click:** "Add Payment Method"

**Note:** They'll charge ₹1 and refund immediately (just verification)

**If it fails:**
- Wait 30 more minutes
- Try again
- Or call bank again

---

## PART 4: Create Your Server (10:30 AM)

### Step 1: Create Droplet

1. **Click:** "Create" → "Droplets" (top right)

2. **Choose Region:**
   - Select: **Bangalore** (BLR1)
   - Why: Closest to you = fastest speed

3. **Choose Image:**
   - Click: **"Ubuntu"**
   - Select: **"22.04 (LTS) x64"**

4. **Choose Size:**
   - Click: **"Basic"**
   - Select: **"Regular"** (not Premium)
   - Choose: **$6/month** plan
   - You get: 1 GB RAM, 1 vCPU, 25 GB SSD

5. **Choose Authentication:**
   - Select: **"Password"**
   - Create strong password: `MyPortfolio@2026!Secure`
   - **WRITE THIS DOWN!** You'll need it!

6. **Finalize Details:**
   - Hostname: `mukesh-portfolio`
   - Tags: Leave empty
   - Project: Default

7. **Advanced Options:**
   - ❌ Don't check anything!
   - Leave all unchecked

8. **Click:** "Create Droplet"

9. **Wait:** 1-2 minutes

### Step 2: Get Your IP Address

After creation, you'll see:
- **Droplet name:** mukesh-portfolio
- **IP address:** Something like `143.198.45.123`

**COPY THIS IP ADDRESS!** 

**Write it down:**
```
My Droplet IP: ___________________
```

---

## PART 5: Connect to Your Server (10:35 AM)

### Step 1: Open PowerShell

1. Press `Windows + X`
2. Click "Windows PowerShell" or "Terminal"

### Step 2: Connect via SSH

**Type this command (replace with YOUR IP):**

```bash
ssh root@YOUR_DROPLET_IP
```

**Example:**
```bash
ssh root@143.198.45.123
```

**Press Enter**

**It will ask:**
```
Are you sure you want to continue connecting (yes/no)?
```

**Type:** `yes` and press Enter

**It will ask:**
```
root@143.198.45.123's password:
```

**Type your droplet password** (the one you created earlier)
**Note:** You won't see anything while typing - this is normal!

**Press Enter**

**You should see:**
```
Welcome to Ubuntu 22.04 LTS
root@mukesh-portfolio:~#
```

**🎉 YOU'RE IN!** You're now inside your server!

---

## PART 6: Setup Server (10:40 AM)

**Just copy-paste these commands one by one:**

### Step 1: Update System

```bash
apt update && apt upgrade -y
```

**Wait:** 2-3 minutes

### Step 2: Install Node.js

```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | 
bash - apt install -y nodejs
```

**Wait:** 1-2 minutes

**Verify:**
```bash
node --version
npm --version
```

**You should see:**
```
v18.x.x
9.x.x
```

### Step 3: Install MySQL

```bash
apt install mysql-server -y
```

**Wait:** 2-3 minutes

### Step 4: Secure MySQL

```bash
mysql_secure_installation
```

**Follow these answers:**

```
VALIDATE PASSWORD COMPONENT? → n (press n)
Set root password? → Y (press y)
New password: → Type: MySQL@2026!Secure
Re-enter: → Type: MySQL@2026!Secure
Remove anonymous users? → Y
Disallow root login remotely? → Y
Remove test database? → Y
Reload privilege tables? → Y
```

**WRITE DOWN YOUR MYSQL PASSWORD:**
```
MySQL Password: MySQL@2026!Secure
```

### Step 5: Install Git

```bash
apt install git -y
```

---

## PART 7: Create Database (11:00 AM)

### Step 1: Login to MySQL

```bash
mysql -u root -p
```

**Enter password:** `MySQL@2026!Secure`

**You should see:**
```
mysql>
```

### Step 2: Create Database and User

**Copy-paste these commands:**

```sql
CREATE DATABASE portfolio_db;
CREATE USER 'portfolio_user'@'localhost' IDENTIFIED BY 'Portfolio@DB2026!';
GRANT ALL PRIVILEGES ON portfolio_db.* TO 'portfolio_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

**WRITE DOWN:**
```
Database Name: portfolio_db
Database User: portfolio_user
Database Password: Portfolio@DB2026!
```

---

## PART 8: Deploy Your Code (11:10 AM)

### Step 1: Clone Your Repository

```bash
cd /var/www
git clone https://github.com/mukesh-sm-fsjwd/portfolio.git
cd portfolio
```

### Step 2: Install Dependencies

```bash
npm install
```

**Wait:** 2-3 minutes

### Step 3: Create .env File

```bash
nano .env
```

**This opens a text editor. Type this:**

```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=portfolio_db
DB_USER=portfolio_user
DB_PASSWORD=Portfolio@DB2026!
SESSION_SECRET=make_this_very_long_and_random_string_here_123456789
NODE_ENV=production
PORT=3000
```

**To save:**
1. Press `Ctrl + X`
2. Press `Y`
3. Press `Enter`

### Step 4: Test Your App

```bash
node server.js
```

**You should see:**
```
╔══════════════════════════════════════╗
║   Portfolio Server Running! 🚀       ║
╚══════════════════════════════════════╝

🌐 Portfolio: http://localhost:3000
✅ MySQL Connected Successfully!
```

**If you see this → SUCCESS!**

**Press:** `Ctrl + C` to stop

---

## PART 9: Keep App Running (11:20 AM)

### Step 1: Install PM2

```bash
npm install -g pm2
```

### Step 2: Start App with PM2

```bash
pm2 start server.js --name portfolio
```

**You should see:**
```
┌─────┬──────────────┬─────────┬─────────┐
│ id  │ name         │ status  │ restart │
├─────┼──────────────┼─────────┼─────────┤
│ 0   │ portfolio    │ online  │ 0       │
└─────┴──────────────┴─────────┴─────────┘
```

### Step 3: Save PM2 Configuration

```bash
pm2 save
pm2 startup
```

**It will show a command like:**
```
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u root --hp /root
```

**Copy that entire command and run it!**

---

## PART 10: Setup Web Server (11:30 AM)

### Step 1: Install Nginx

```bash
apt install nginx -y
```

### Step 2: Create Nginx Configuration

```bash
nano /etc/nginx/sites-available/portfolio
```

**Type this (replace YOUR_DROPLET_IP with your actual IP):**

```nginx
server {
    listen 80;
    server_name YOUR_DROPLET_IP smmukesh.me www.smmukesh.me;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

**Example (if your IP is 143.198.45.123):**
```nginx
server_name 143.198.45.123 smmukesh.me www.smmukesh.me;
```

**Save:** `Ctrl + X`, `Y`, `Enter`

### Step 3: Enable Site

```bash
ln -s /etc/nginx/sites-available/portfolio /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

**You should see:**
```
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

---

## PART 11: Test Your Live Site! (11:40 AM)

### Open Browser

**Go to:** `http://YOUR_DROPLET_IP`

**Example:** `http://143.198.45.123`

**YOU SHOULD SEE YOUR PORTFOLIO!** 🎉🎉🎉

**Test:**
- ✅ Homepage loads
- ✅ Navigation works
- ✅ Admin panel: `http://YOUR_IP/admin.html`

---

## PART 12: Connect Domain (11:50 AM)

### Step 1: Login to Namecheap

1. Go to: https://www.namecheap.com
2. Login with your account
3. Click: "Domain List"
4. Find: `smmukesh.me`
5. Click: "Manage"

### Step 2: Setup DNS

1. Click: **"Advanced DNS"** tab

2. **Delete all existing records**

3. **Add these records:**

**Record 1:**
```
Type: A Record
Host: @
Value: YOUR_DROPLET_IP (example: 143.198.45.123)
TTL: Automatic
```

**Record 2:**
```
Type: A Record
Host: www
Value: YOUR_DROPLET_IP (example: 143.198.45.123)
TTL: Automatic
```

4. **Click:** "Save All Changes"

### Step 3: Wait for DNS Propagation

**Time:** 1-24 hours (usually 1-2 hours)

**Check status:**
- Go to: https://dnschecker.org
- Enter: `smmukesh.me`
- See if it shows your IP

---

## PART 13: Setup SSL (HTTPS) (After DNS works)

**Wait until `smmukesh.me` works in browser, then:**

### Connect to Server Again

```bash
ssh root@YOUR_DROPLET_IP
```

### Install Certbot

```bash
apt install certbot python3-certbot-nginx -y
```

### Get SSL Certificate

```bash
certbot --nginx -d smmukesh.me -d www.smmukesh.me
```

**Follow prompts:**
```
Enter email: your-email@gmail.com
Agree to terms: Y
Share email: N
Redirect HTTP to HTTPS: 2 (select option 2)
```

**Done!** Your site now has HTTPS! 🔒

---

## PART 14: Final Testing (12:00 PM)

### Test Everything:

1. **Portfolio:** https://smmukesh.me ✅
2. **Admin:** https://smmukesh.me/admin.html ✅
3. **Login works** ✅
4. **Upload project** ✅
5. **Contact form** ✅

**ALL WORKING?** 🎉🎉🎉

---

## 📝 Important Commands Reference

### Check if app is running:
```bash
pm2 status
```

### View app logs:
```bash
pm2 logs portfolio
```

### Restart app:
```bash
pm2 restart portfolio
```

### Update code (after pushing to GitHub):
```bash
cd /var/www/portfolio
git pull
npm install
pm2 restart portfolio
```

### Check Nginx status:
```bash
systemctl status nginx
```

### Restart Nginx:
```bash
systemctl restart nginx
```

---

## 🆘 Troubleshooting

### Site not loading?

**Check PM2:**
```bash
pm2 status
pm2 logs portfolio
```

**Check Nginx:**
```bash
systemctl status nginx
nginx -t
```

### Database connection error?

**Check MySQL:**
```bash
systemctl status mysql
mysql -u portfolio_user -p portfolio_db
```

### Domain not working?

**Check DNS:**
- Go to: https://dnschecker.org
- Enter: smmukesh.me
- Wait if not propagated yet

### SSL certificate error?

**Renew certificate:**
```bash
certbot renew
```

---

## ✅ Final Checklist

**After everything is done:**

- [ ] Site loads at https://smmukesh.me
- [ ] Admin panel works
- [ ] Can login
- [ ] Can upload projects
- [ ] Contact form works
- [ ] Mobile responsive
- [ ] SSL certificate (HTTPS) working

---

## 🎉 Congratulations!

**Your portfolio is LIVE on the internet!**

**Share it:**
- ✅ Add to LinkedIn
- ✅ Add to resume
- ✅ Share with friends
- ✅ Apply for jobs!

**Your URLs:**
- Portfolio: https://smmukesh.me
- Admin: https://smmukesh.me/admin.html

---

## 📊 What You Accomplished

- ✅ Enabled international transactions
- ✅ Got free domain (smmukesh.me)
- ✅ Setup Linux server
- ✅ Installed Node.js, MySQL, Nginx
- ✅ Deployed your portfolio
- ✅ Connected custom domain
- ✅ Setup SSL/HTTPS
- ✅ Professional portfolio live!

**Total Cost:** $0 for 2+ years!

---

## 💡 Next Steps

1. **Update resume** with your portfolio link
2. **Update LinkedIn** with your website
3. **Add projects** regularly
4. **Monitor** your site (UptimeRobot)
5. **Apply for jobs!**

---

**Good luck tomorrow! Follow this guide step-by-step and you'll be live by lunch time!** 🚀

**If you get stuck anywhere, note down the error message and we'll fix it!**
