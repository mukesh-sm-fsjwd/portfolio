// ============================================
// PORTFOLIO SERVER - MySQL + Security
// ============================================
require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const session = require('express-session');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================
// DATABASE CONNECTION POOL
// ============================================
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'portfolio_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test database connection
pool.getConnection()
    .then(connection => {
        console.log('✅ MySQL Connected Successfully!');
        connection.release();
    })
    .catch(err => {
        console.error('❌ MySQL Connection Error:', err.message);
        console.error('Please check your .env file and WAMP server!');
    });

// ============================================
// MIDDLEWARE
// ============================================

// Security headers
app.use(helmet({
    contentSecurityPolicy: false, // Disable for development
}));

// CORS
app.use(cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || 'http://localhost:3000',
    credentials: true
}));

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Session management
app.use(session({
    secret: process.env.SESSION_SECRET || 'change-this-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: parseInt(process.env.SESSION_TIMEOUT) || 3600000 // 1 hour
    }
}));

// Static files
app.use(express.static('.'));
app.use('/uploads', express.static('uploads'));

// Rate limiting for login
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts
    message: 'Too many login attempts. Please try again later.'
});

// ============================================
// FILE UPLOAD CONFIGURATION
// ============================================
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let uploadPath = 'uploads/';
        if (file.fieldname === 'image' || file.fieldname === 'profileImage') {
            uploadPath += 'images/';
        } else if (file.fieldname === 'pdf') {
            uploadPath += 'pdfs/';
        } else if (file.fieldname === 'resume') {
            uploadPath += 'resumes/';
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    const allowedImageTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    const allowedPdfTypes = ['application/pdf'];

    if (file.fieldname === 'pdf' || file.fieldname === 'resume') {
        if (allowedPdfTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Only PDF files are allowed!'), false);
        }
    } else {
        if (allowedImageTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'), false);
        }
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 // 5MB
    }
});

// ============================================
// AUTHENTICATION MIDDLEWARE
// ============================================
const requireAuth = (req, res, next) => {
    if (req.session && req.session.adminId) {
        next();
    } else {
        res.status(401).json({ success: false, message: 'Unauthorized' });
    }
};

// ============================================
// HELPER FUNCTIONS
// ============================================

// Log activity
async function logActivity(adminId, action, details, ipAddress) {
    try {
        await pool.execute(
            'INSERT INTO activity_log (admin_id, action, details, ip_address) VALUES (?, ?, ?, ?)',
            [adminId, action, details, ipAddress]
        );
    } catch (err) {
        console.error('Activity log error:', err);
    }
}

// Calculate certificate duration
function calculateDuration(fromDate, toDate) {
    const from = new Date(fromDate);
    const to = new Date(toDate);
    const diffTime = Math.abs(to - from);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const diffMonths = Math.floor(diffDays / 30);
    const remainingDays = diffDays % 30;

    if (diffMonths > 0) {
        let duration = `${diffMonths} month${diffMonths > 1 ? 's' : ''}`;
        if (remainingDays > 0) {
            duration += ` ${remainingDays} day${remainingDays > 1 ? 's' : ''}`;
        }
        return duration;
    }
    return `${diffDays} day${diffDays > 1 ? 's' : ''}`;
}

// ============================================
// AUTHENTICATION ROUTES
// ============================================

// Login
app.post('/api/login', loginLimiter, async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ success: false, message: 'Username and password required' });
        }

        const [users] = await pool.execute(
            'SELECT * FROM admin_users WHERE username = ? AND is_active = TRUE',
            [username]
        );

        if (users.length === 0) {
            await logActivity(null, 'LOGIN_FAILED', `Failed login attempt for: ${username}`, req.ip);
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const user = users[0];

        // Check if password needs to be hashed (first time setup)
        if (user.password_hash === 'TEMP_WILL_BE_HASHED') {
            const hashedPassword = await bcrypt.hash(password, 10);
            await pool.execute(
                'UPDATE admin_users SET password_hash = ? WHERE id = ?',
                [hashedPassword, user.id]
            );
            user.password_hash = hashedPassword;
        }

        const passwordMatch = await bcrypt.compare(password, user.password_hash);

        if (!passwordMatch) {
            await logActivity(user.id, 'LOGIN_FAILED', 'Invalid password', req.ip);
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        // Create session
        req.session.adminId = user.id;
        req.session.username = user.username;

        // Update last login
        await pool.execute(
            'UPDATE admin_users SET last_login = NOW() WHERE id = ?',
            [user.id]
        );

        await logActivity(user.id, 'LOGIN_SUCCESS', 'Successful login', req.ip);

        res.json({
            success: true,
            message: 'Login successful',
            user: { id: user.id, username: user.username }
        });

    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Logout
app.post('/api/logout', requireAuth, async (req, res) => {
    const adminId = req.session.adminId;
    await logActivity(adminId, 'LOGOUT', 'User logged out', req.ip);

    req.session.destroy();
    res.json({ success: true, message: 'Logged out successfully' });
});

// Check auth status
app.get('/api/check-auth', (req, res) => {
    if (req.session && req.session.adminId) {
        res.json({ authenticated: true, username: req.session.username });
    } else {
        res.json({ authenticated: false });
    }
});

// ============================================
// PROFILE ROUTES
// ============================================

// Get profile
app.get('/api/profile', async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM profile LIMIT 1');

        if (rows.length === 0) {
            return res.json({
                name: 'Your Name',
                title: 'Backend Engineer',
                punchline: 'Building amazing things',
                about: 'About me...',
                email: 'email@example.com',
                phone: '+1234567890',
                location: 'City, Country'
            });
        }

        res.json(rows[0]);
    } catch (err) {
        console.error('Get profile error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Update profile
app.post('/api/profile', requireAuth, upload.single('profileImage'), async (req, res) => {
    try {
        const { name, title, punchline, about, email, phone, location, github_url, linkedin_url, twitter_url } = req.body;

        let imagePath = null;
        if (req.file) {
            imagePath = `/uploads/images/${req.file.filename}`;
        }

        const [existing] = await pool.execute('SELECT * FROM profile LIMIT 1');

        if (existing.length === 0) {
            // Insert new profile
            await pool.execute(
                `INSERT INTO profile (name, title, punchline, about, email, phone, location, image_path, github_url, linkedin_url, twitter_url) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [name, title, punchline, about, email, phone, location, imagePath, github_url, linkedin_url, twitter_url]
            );
        } else {
            // Update existing profile
            const updateQuery = imagePath
                ? `UPDATE profile SET name=?, title=?, punchline=?, about=?, email=?, phone=?, location=?, image_path=?, github_url=?, linkedin_url=?, twitter_url=? WHERE id=?`
                : `UPDATE profile SET name=?, title=?, punchline=?, about=?, email=?, phone=?, location=?, github_url=?, linkedin_url=?, twitter_url=? WHERE id=?`;

            const params = imagePath
                ? [name, title, punchline, about, email, phone, location, imagePath, github_url, linkedin_url, twitter_url, existing[0].id]
                : [name, title, punchline, about, email, phone, location, github_url, linkedin_url, twitter_url, existing[0].id];

            await pool.execute(updateQuery, params);
        }

        await logActivity(req.session.adminId, 'PROFILE_UPDATE', 'Profile updated', req.ip);

        res.json({ success: true, message: 'Profile updated successfully' });
    } catch (err) {
        console.error('Update profile error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ============================================
// SKILLS ROUTES
// ============================================

// Get all skills
app.get('/api/skills', async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM skills ORDER BY display_order, id');
        res.json(rows);
    } catch (err) {
        console.error('Get skills error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Add skill
app.post('/api/skills', requireAuth, async (req, res) => {
    try {
        const { name, category, level, icon } = req.body;

        const [result] = await pool.execute(
            'INSERT INTO skills (name, category, level, icon) VALUES (?, ?, ?, ?)',
            [name, category, level || 'Intermediate', icon || '']
        );

        await logActivity(req.session.adminId, 'SKILL_ADD', `Added skill: ${name}`, req.ip);

        res.json({ success: true, message: 'Skill added successfully', id: result.insertId });
    } catch (err) {
        console.error('Add skill error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Update skill
app.put('/api/skills/:id', requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const { name, category, level, icon } = req.body;

        await pool.execute(
            'UPDATE skills SET name=?, category=?, level=?, icon=? WHERE id=?',
            [name, category, level, icon, id]
        );

        await logActivity(req.session.adminId, 'SKILL_UPDATE', `Updated skill ID: ${id}`, req.ip);

        res.json({ success: true, message: 'Skill updated successfully' });
    } catch (err) {
        console.error('Update skill error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Delete skill
app.delete('/api/skills/:id', requireAuth, async (req, res) => {
    try {
        const { id } = req.params;

        await pool.execute('DELETE FROM skills WHERE id=?', [id]);

        await logActivity(req.session.adminId, 'SKILL_DELETE', `Deleted skill ID: ${id}`, req.ip);

        res.json({ success: true, message: 'Skill deleted successfully' });
    } catch (err) {
        console.error('Delete skill error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Continue in next file...
