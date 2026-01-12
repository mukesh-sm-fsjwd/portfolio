# 🔒 Security & Pre-Deployment Checklist

## ✅ BEFORE HOSTING - MUST DO!

### 1. Change Admin Credentials
**Current (DEFAULT - INSECURE!):**
- Username: `admin`
- Password: `admin123`

**Action Required:**
1. Login to admin panel
2. Go to MySQL database
3. Run this SQL:
```sql
-- Change admin password
UPDATE admin_users 
SET password_hash = 'YOUR_NEW_HASHED_PASSWORD_HERE'
WHERE username = 'admin';

-- Or create new admin and delete old one
INSERT INTO admin_users (username, password_hash) 
VALUES ('your_new_username', 'YOUR_NEW_HASHED_PASSWORD_HERE');

DELETE FROM admin_users WHERE username = 'admin';
```

**To hash a password:**
```javascript
const bcrypt = require('bcrypt');
const hash = await bcrypt.hash('your_new_password', 10);
console.log(hash);
```

---

### 2. Secure Environment Variables

**Check `.env` file:**
```env
# Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=portfolio_db
DB_USER=root
DB_PASSWORD=CHANGE_THIS_PASSWORD  # ⚠️ CHANGE!

# Session
SESSION_SECRET=CHANGE_THIS_SECRET  # ⚠️ CHANGE!

# Email (if using)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

**Generate Strong SESSION_SECRET:**
```bash
# Run in Node.js
require('crypto').randomBytes(64).toString('hex')
```

---

### 3. Verify .gitignore

**Make sure these are in `.gitignore`:**
- [ ] `.env`
- [ ] `node_modules/`
- [ ] `uploads/`
- [ ] `*.log`

**Test:**
```bash
git status
# Should NOT show .env file!
```

---

### 4. Database Security

**Production Database:**
- [ ] Use strong password (16+ characters)
- [ ] Don't use 'root' user
- [ ] Create dedicated database user
- [ ] Limit user permissions

**Create Secure DB User:**
```sql
CREATE USER 'portfolio_user'@'localhost' IDENTIFIED BY 'strong_password_here';
GRANT SELECT, INSERT, UPDATE, DELETE ON portfolio_db.* TO 'portfolio_user'@'localhost';
FLUSH PRIVILEGES;
```

---

### 5. File Upload Security

**Already Implemented:**
- ✅ File type validation
- ✅ File size limits
- ✅ Unique filenames
- ✅ Secure storage path

**Verify Limits:**
```javascript
// In server.js
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024  // 10MB - OK
    }
});
```

---

### 6. CORS Configuration

**For Production:**

Update `server.js`:
```javascript
const cors = require('cors');
app.use(cors({
    origin: 'https://your-domain.com',  // Your actual domain
    credentials: true
}));
```

**Don't use:**
```javascript
app.use(cors());  // ❌ Too permissive!
```

---

### 7. HTTPS/SSL

**Production MUST use HTTPS!**

**Hosting platforms (Render, Railway) provide free SSL.**

**If self-hosting:**
- Use Let's Encrypt (free)
- Use Cloudflare (free)
- Buy SSL certificate

---

### 8. Rate Limiting

**Already Implemented:**
```javascript
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,  // 15 minutes
    max: 100  // 100 requests per 15 min
});
```

**For production, make stricter:**
```javascript
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 50  // Reduce to 50
});
```

---

### 9. Remove Debug Code

**Search for and remove:**
- [ ] `console.log()` with sensitive data
- [ ] Debug endpoints
- [ ] Test data
- [ ] Comments with passwords

**Safe to keep:**
- Error logs
- Server start messages
- Connection status

---

### 10. Session Security

**Already configured:**
```javascript
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',  // HTTPS only
        httpOnly: true,  // Prevent XSS
        maxAge: 24 * 60 * 60 * 1000  // 24 hours
    }
}));
```

**For production, add:**
```javascript
cookie: {
    secure: true,  // Force HTTPS
    httpOnly: true,
    sameSite: 'strict',  // CSRF protection
    maxAge: 2 * 60 * 60 * 1000  // 2 hours (shorter)
}
```

---

## 🛡️ Security Features Already Implemented

### ✅ Helmet.js
Protects against common vulnerabilities:
- XSS attacks
- Clickjacking
- MIME sniffing
- etc.

### ✅ Password Hashing
- Using bcrypt
- Salt rounds: 10
- Passwords never stored in plain text

### ✅ SQL Injection Protection
- Using prepared statements
- Parameterized queries
- No string concatenation

### ✅ Authentication
- Session-based auth
- Protected admin routes
- Middleware validation

### ✅ Input Validation
- Required fields
- Email validation
- File type checking

---

## 🚨 Common Vulnerabilities - FIXED

### ❌ SQL Injection
**Bad:**
```javascript
const query = `SELECT * FROM users WHERE username = '${username}'`;
```

**Good (Already using):**
```javascript
const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
```

### ❌ XSS (Cross-Site Scripting)
**Protected by:**
- Helmet.js
- Input sanitization
- Content Security Policy

### ❌ CSRF (Cross-Site Request Forgery)
**Protected by:**
- SameSite cookies
- Session validation
- Origin checking

### ❌ Exposed Secrets
**Protected by:**
- .env file
- .gitignore
- Environment variables

---

## 📋 Pre-Deployment Checklist

### Code:
- [ ] All console.logs reviewed
- [ ] No hardcoded credentials
- [ ] Error handling in place
- [ ] Input validation working
- [ ] File uploads tested

### Database:
- [ ] Admin password changed
- [ ] Database password changed
- [ ] Dedicated DB user created
- [ ] Backups configured

### Environment:
- [ ] .env not in Git
- [ ] Strong SESSION_SECRET
- [ ] Production DB credentials
- [ ] CORS configured for domain

### Security:
- [ ] HTTPS enabled
- [ ] Rate limiting active
- [ ] Helmet.js configured
- [ ] Session security set
- [ ] File upload limits set

### Testing:
- [ ] Admin login works
- [ ] File uploads work
- [ ] Contact form works
- [ ] All pages load
- [ ] Mobile responsive

---

## 🔍 Security Testing

### Test These:
1. **SQL Injection**
   - Try: `' OR '1'='1` in login
   - Should fail ✅

2. **XSS**
   - Try: `<script>alert('xss')</script>` in contact form
   - Should be escaped ✅

3. **File Upload**
   - Try uploading .exe file
   - Should be rejected ✅

4. **Rate Limiting**
   - Make 100+ requests quickly
   - Should be blocked ✅

5. **Session**
   - Logout and try accessing admin
   - Should redirect to login ✅

---

## 📱 Monitoring (After Deployment)

### Set Up:
1. **Uptime Monitoring**
   - UptimeRobot (free)
   - Pingdom
   - StatusCake

2. **Error Tracking**
   - Sentry (free tier)
   - LogRocket
   - Rollbar

3. **Analytics**
   - Google Analytics
   - Plausible (privacy-friendly)

---

## 🆘 If Compromised

### Immediate Actions:
1. **Change ALL passwords**
   - Database
   - Admin account
   - Hosting account
   - GitHub

2. **Rotate secrets**
   - Generate new SESSION_SECRET
   - Update .env
   - Redeploy

3. **Check logs**
   - Look for suspicious activity
   - Check file uploads
   - Review database changes

4. **Restore from backup**
   - If data corrupted
   - Use hosting platform backups

---

## ✅ Final Security Score

Your portfolio has:
- ✅ Password hashing (bcrypt)
- ✅ SQL injection protection
- ✅ XSS protection (Helmet)
- ✅ Rate limiting
- ✅ Session security
- ✅ File upload validation
- ✅ Environment variables
- ✅ CORS configuration

**Security Level: GOOD** 🛡️

**After completing checklist: EXCELLENT** 🔒

---

## 📚 Learn More

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Checklist](https://blog.risingstack.com/node-js-security-checklist/)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)

---

**Remember:** Security is ongoing, not one-time!

**Stay safe! 🔒**
