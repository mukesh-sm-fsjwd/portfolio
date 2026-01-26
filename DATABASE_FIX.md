# 🚨 URGENT FIX - Your Database is Empty!

## Problem:
Your site shows "Your Name" because the database has NO TABLES and NO DATA!

You created the database but forgot to:
1. Create the tables (admin_users, profile, skills, projects, etc.)
2. Import your data

---

## 🔧 SOLUTION - Import Database Structure

### Step 1: Connect to Your Server

```bash
ssh root@143.244.136.225
```

### Step 2: Go to Your Project Folder

```bash
cd /var/www/portfolio
```

### Step 3: Check if Server.js Creates Tables Automatically

Your `server.js` should have code to create tables automatically. Let's check the logs:

```bash
pm2 logs portfolio
```

**Look for:** "Creating tables..." or "Database initialized"

---

## 🎯 QUICK FIX - Create Tables Manually

### Connect to MySQL:

```bash
mysql -u portfolio_user -p
```

**Password:** `Portfolio@DB2026!`

### Use Your Database:

```sql
USE portfolio_db;
```

### Create All Tables:

```sql
-- Admin Users Table
CREATE TABLE IF NOT EXISTS admin_users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    last_login DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Profile Table
CREATE TABLE IF NOT EXISTS profile (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) DEFAULT 'Mukesh SM',
    title VARCHAR(255) DEFAULT 'Java Full Stack Developer',
    punchline TEXT,
    about_me TEXT,
    email VARCHAR(255),
    phone VARCHAR(50),
    location VARCHAR(255),
    github_url VARCHAR(255),
    linkedin_url VARCHAR(255),
    leetcode_url VARCHAR(255),
    profile_image VARCHAR(255),
    resume_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Skills Table
CREATE TABLE IF NOT EXISTS skills (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    proficiency INT DEFAULT 80,
    icon VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Projects Table
CREATE TABLE IF NOT EXISTS projects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    image_url VARCHAR(255),
    github_url VARCHAR(255),
    live_url VARCHAR(255),
    technologies TEXT,
    status VARCHAR(50) DEFAULT 'completed',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Certificates Table
CREATE TABLE IF NOT EXISTS certificates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    issuer VARCHAR(255),
    issue_date DATE,
    credential_id VARCHAR(255),
    credential_url VARCHAR(255),
    pdf_url VARCHAR(255),
    image_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Messages Table
CREATE TABLE IF NOT EXISTS messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    subject VARCHAR(255),
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Activity Logs Table
CREATE TABLE IF NOT EXISTS activity_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    admin_id INT,
    action VARCHAR(255),
    details TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Insert Default Profile Data:

```sql
INSERT INTO profile (name, title, punchline, about_me, email, location) 
VALUES (
    'Mukesh SM',
    'Java Full Stack Developer',
    'Building powerful web applications with modern technologies',
    'Passionate developer specializing in Java, Spring Boot, and full-stack development. Currently pursuing my degree while building real-world projects.',
    'smmukesh.ai369@gmail.com',
    'India'
);
```

### Create Admin User:

```sql
-- You need to hash the password first
-- For now, let's create with a temp password
INSERT INTO admin_users (username, password_hash, is_active) 
VALUES ('mukeshadmin@gmail.com', '$2b$10$3f6ocAAVFSEJACoYOrIsa.yvZSZCgJ8zf2h60Syy9w4YYNWNm3U0e', TRUE);
```

### Verify Tables Created:

```sql
SHOW TABLES;
```

**You should see:**
- admin_users
- profile
- skills
- projects
- certificates
- messages
- activity_logs

### Check Profile Data:

```sql
SELECT * FROM profile;
```

**You should see your name!**

### Exit MySQL:

```sql
EXIT;
```

---

## 🔄 Restart Your App

```bash
pm2 restart portfolio
pm2 logs portfolio
```

---

## 🌐 Test Your Site

**Open browser:**
```
http://143.244.136.225
```

**You should NOW see:**
- ✅ Your name (Mukesh SM)
- ✅ Your title (Java Full Stack Developer)
- ✅ Proper content

---

## 🔐 Fix Admin Login

### The admin password hash I gave you is for: `MugeshManoharan@admin`

**Try logging in:**
1. Go to: `http://143.244.136.225/admin.html`
2. Username: `mukeshadmin@gmail.com`
3. Password: `MugeshManoharan@admin`

**If it doesn't work, create new admin:**

```bash
ssh root@143.244.136.225
cd /var/www/portfolio
node
```

**In Node console:**
```javascript
const bcrypt = require('bcrypt');
bcrypt.hash('YourNewPassword123!', 10).then(hash => console.log(hash));
```

**Copy the hash, then:**

```sql
mysql -u portfolio_user -p
USE portfolio_db;
UPDATE admin_users SET password_hash = 'PASTE_HASH_HERE' WHERE username = 'mukeshadmin@gmail.com';
EXIT;
```

---

## ✅ Final Check

1. **Homepage:** http://143.244.136.225
   - Should show your name
   - Should show your title
   - Should have content

2. **Admin:** http://143.244.136.225/admin.html
   - Should login successfully
   - Should show dashboard

---

## 🎯 Next Steps After This Works:

1. Add your skills
2. Add your projects
3. Upload certificates
4. Connect domain (smmukesh.me)
5. Setup SSL (HTTPS)

---

**DO THIS NOW AND TELL ME THE RESULTS!** 🚀
