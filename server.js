// ============================================
// PORTFOLIO SERVER - MySQL + Security
// Complete Backend with All Features
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
        console.log('\n╔══════════════════════════════════════╗');
        console.log('║   ✅ MySQL Connected Successfully!   ║');
        console.log('╚══════════════════════════════════════╝\n');
        connection.release();
    })
    .catch(err => {
        console.error('\n╔══════════════════════════════════════╗');
        console.error('║   ❌ MySQL Connection Error!         ║');
        console.error('╚══════════════════════════════════════╝');
        console.error('Error:', err.message);
        console.error('\n⚠️  Please check:');
        console.error('   1. WAMP server is running (green icon)');
        console.error('   2. .env file has correct database settings');
        console.error('   3. Database "portfolio_db" exists\n');
    });

// ============================================
// MIDDLEWARE
// ============================================

// Security headers
app.use(helmet({
    contentSecurityPolicy: false,
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
        maxAge: 3600000 // 1 hour
    }
}));

// Static files
app.use(express.static('.'));
app.use('/uploads', express.static('uploads'));

// Rate limiting
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
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
    limits: { fileSize: 5 * 1024 * 1024 }
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

app.post('/api/login', loginLimiter, async (req, res) => {
    try {
        const { username, password } = req.body;

        console.log('🔐 Login attempt:', { username, passwordLength: password?.length });

        if (!username || !password) {
            return res.status(400).json({ success: false, message: 'Username and password required' });
        }

        const [users] = await pool.execute(
            'SELECT * FROM admin_users WHERE username = ? AND is_active = TRUE',
            [username]
        );

        console.log('👤 Users found:', users.length);
        if (users.length > 0) {
            console.log('📝 User data:', {
                id: users[0].id,
                username: users[0].username,
                hasPasswordHash: !!users[0].password_hash,
                passwordHashLength: users[0].password_hash?.length
            });
        }

        if (users.length === 0) {
            console.log('❌ No user found with username:', username);
            await logActivity(null, 'LOGIN_FAILED', `Failed login attempt for: ${username}`, req.ip);
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const user = users[0];

        // First time setup - hash the password
        if (user.password_hash === 'TEMP_WILL_BE_HASHED') {
            const hashedPassword = await bcrypt.hash(password, 10);
            await pool.execute(
                'UPDATE admin_users SET password_hash = ? WHERE id = ?',
                [hashedPassword, user.id]
            );
            user.password_hash = hashedPassword;
        }

        console.log('🔑 Comparing password...');
        const passwordMatch = await bcrypt.compare(password, user.password_hash);
        console.log('✅ Password match:', passwordMatch);

        if (!passwordMatch) {
            console.log('❌ Password mismatch!');
            await logActivity(user.id, 'LOGIN_FAILED', 'Invalid password', req.ip);
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        req.session.adminId = user.id;
        req.session.username = user.username;

        await pool.execute('UPDATE admin_users SET last_login = NOW() WHERE id = ?', [user.id]);
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

app.post('/api/logout', requireAuth, async (req, res) => {
    const adminId = req.session.adminId;
    await logActivity(adminId, 'LOGOUT', 'User logged out', req.ip);
    req.session.destroy();
    res.json({ success: true, message: 'Logged out successfully' });
});

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
                location: 'City, Country',
                image_path: null
            });
        }

        res.json(rows[0]);
    } catch (err) {
        console.error('Get profile error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

app.post('/api/profile', requireAuth, upload.single('profileImage'), async (req, res) => {
    try {
        const { name, title, punchline, about, email, phone, location, github_url, linkedin_url, twitter_url } = req.body;

        let imagePath = null;
        if (req.file) {
            imagePath = `/uploads/images/${req.file.filename}`;
        }

        const [existing] = await pool.execute('SELECT * FROM profile LIMIT 1');

        if (existing.length === 0) {
            await pool.execute(
                `INSERT INTO profile (name, title, punchline, about, email, phone, location, image_path, github_url, linkedin_url, twitter_url) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [name, title, punchline, about, email, phone, location, imagePath, github_url || null, linkedin_url || null, twitter_url || null]
            );
        } else {
            const updateQuery = imagePath
                ? `UPDATE profile SET name=?, title=?, punchline=?, about=?, email=?, phone=?, location=?, image_path=?, github_url=?, linkedin_url=?, twitter_url=? WHERE id=?`
                : `UPDATE profile SET name=?, title=?, punchline=?, about=?, email=?, phone=?, location=?, github_url=?, linkedin_url=?, twitter_url=? WHERE id=?`;

            const params = imagePath
                ? [name, title, punchline, about, email, phone, location, imagePath, github_url || null, linkedin_url || null, twitter_url || null, existing[0].id]
                : [name, title, punchline, about, email, phone, location, github_url || null, linkedin_url || null, twitter_url || null, existing[0].id];

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

app.get('/api/skills', async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM skills ORDER BY display_order, id');
        res.json(rows);
    } catch (err) {
        console.error('Get skills error:', err);
        res.status(500).json([]);
    }
});

// Get single skill by ID
app.get('/api/skills/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await pool.execute('SELECT * FROM skills WHERE id = ?', [id]);

        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Skill not found' });
        }

        res.json(rows[0]);
    } catch (err) {
        console.error('Get skill error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

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

// ============================================
// TECHNOLOGIES ROUTES
// ============================================

app.get('/api/technologies', async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM technologies ORDER BY category, name');
        res.json(rows);
    } catch (err) {
        console.error('Get technologies error:', err);
        res.status(500).json([]);
    }
});

app.post('/api/technologies', requireAuth, async (req, res) => {
    try {
        const { name, category, icon_class, icon_url } = req.body;

        const [result] = await pool.execute(
            'INSERT INTO technologies (name, category, icon_class, icon_url, is_custom) VALUES (?, ?, ?, ?, ?)',
            [name, category, icon_class || null, icon_url || null, icon_url ? true : false]
        );

        await logActivity(req.session.adminId, 'TECH_CREATE', `Created technology: ${name}`, req.ip);
        res.json({ success: true, message: 'Technology added successfully', id: result.insertId });
    } catch (err) {
        console.error('Add technology error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

app.delete('/api/technologies/:id', requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        await pool.execute('DELETE FROM technologies WHERE id=?', [id]);
        await logActivity(req.session.adminId, 'TECH_DELETE', `Deleted technology ID: ${id}`, req.ip);
        res.json({ success: true, message: 'Technology deleted successfully' });
    } catch (err) {
        console.error('Delete technology error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ============================================
// PROJECTS ROUTES
// ============================================

app.get('/api/projects', async (req, res) => {
    try {
        const [projects] = await pool.execute('SELECT * FROM projects ORDER BY display_order, created_at DESC');

        // Get technologies for each project
        for (let project of projects) {
            const [techs] = await pool.execute(
                'SELECT technology FROM project_technologies WHERE project_id = ?',
                [project.id]
            );
            project.tech = techs.map(t => t.technology);
        }

        res.json(projects);
    } catch (err) {
        console.error('Get projects error:', err);
        res.status(500).json([]);
    }
});

app.post('/api/projects', requireAuth, upload.single('image'), async (req, res) => {
    try {
        const { title, description, status, github_url, demo_url, technologies } = req.body;

        let imagePath = null;
        if (req.file) {
            imagePath = `/uploads/images/${req.file.filename}`;
        }

        const [result] = await pool.execute(
            'INSERT INTO projects (title, description, status, image_path, github_url, demo_url) VALUES (?, ?, ?, ?, ?, ?)',
            [title, description, status || 'development', imagePath, github_url || '', demo_url || '']
        );

        const projectId = result.insertId;

        // Add technologies
        if (technologies) {
            const techArray = typeof technologies === 'string' ? technologies.split(',').map(t => t.trim()) : technologies;
            for (let tech of techArray) {
                await pool.execute(
                    'INSERT INTO project_technologies (project_id, technology) VALUES (?, ?)',
                    [projectId, tech]
                );
            }
        }

        await logActivity(req.session.adminId, 'PROJECT_ADD', `Added project: ${title}`, req.ip);
        res.json({ success: true, message: 'Project added successfully', id: projectId });
    } catch (err) {
        console.error('Add project error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

app.put('/api/projects/:id', requireAuth, upload.single('image'), async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, status, github_url, demo_url, technologies } = req.body;

        let imagePath = null;
        if (req.file) {
            imagePath = `/uploads/images/${req.file.filename}`;
        }

        const updateQuery = imagePath
            ? 'UPDATE projects SET title=?, description=?, status=?, image_path=?, github_url=?, demo_url=? WHERE id=?'
            : 'UPDATE projects SET title=?, description=?, status=?, github_url=?, demo_url=? WHERE id=?';

        const params = imagePath
            ? [title, description, status, imagePath, github_url || '', demo_url || '', id]
            : [title, description, status, github_url || '', demo_url || '', id];

        await pool.execute(updateQuery, params);

        // Update technologies
        await pool.execute('DELETE FROM project_technologies WHERE project_id=?', [id]);
        if (technologies) {
            const techArray = typeof technologies === 'string' ? technologies.split(',').map(t => t.trim()) : technologies;
            for (let tech of techArray) {
                await pool.execute(
                    'INSERT INTO project_technologies (project_id, technology) VALUES (?, ?)',
                    [id, tech]
                );
            }
        }

        await logActivity(req.session.adminId, 'PROJECT_UPDATE', `Updated project ID: ${id}`, req.ip);
        res.json({ success: true, message: 'Project updated successfully' });
    } catch (err) {
        console.error('Update project error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

app.delete('/api/projects/:id', requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        await pool.execute('DELETE FROM projects WHERE id=?', [id]);
        await logActivity(req.session.adminId, 'PROJECT_DELETE', `Deleted project ID: ${id}`, req.ip);
        res.json({ success: true, message: 'Project deleted successfully' });
    } catch (err) {
        console.error('Delete project error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ============================================
// CERTIFICATES ROUTES
// ============================================

app.get('/api/certificates', async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM certificates ORDER BY display_order, created_at DESC');
        res.json(rows);
    } catch (err) {
        console.error('Get certificates error:', err);
        res.status(500).json([]);
    }
});

app.post('/api/certificates', requireAuth, upload.single('pdf'), async (req, res) => {
    try {
        const { title, issuer, from_date, to_date, verification_url } = req.body;

        let pdfPath = null;
        if (req.file) {
            pdfPath = `/uploads/pdfs/${req.file.filename}`;
        }

        const duration = calculateDuration(from_date, to_date);

        const [result] = await pool.execute(
            'INSERT INTO certificates (title, issuer, from_date, to_date, duration, pdf_path, verification_url) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [title, issuer, from_date, to_date, duration, pdfPath, verification_url || '']
        );

        await logActivity(req.session.adminId, 'CERTIFICATE_ADD', `Added certificate: ${title}`, req.ip);
        res.json({ success: true, message: 'Certificate added successfully', id: result.insertId });
    } catch (err) {
        console.error('Add certificate error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

app.put('/api/certificates/:id', requireAuth, upload.single('pdf'), async (req, res) => {
    try {
        const { id } = req.params;
        const { title, issuer, from_date, to_date, verification_url } = req.body;

        let pdfPath = null;
        if (req.file) {
            pdfPath = `/uploads/pdfs/${req.file.filename}`;
        }

        const duration = calculateDuration(from_date, to_date);

        const updateQuery = pdfPath
            ? 'UPDATE certificates SET title=?, issuer=?, from_date=?, to_date=?, duration=?, pdf_path=?, verification_url=? WHERE id=?'
            : 'UPDATE certificates SET title=?, issuer=?, from_date=?, to_date=?, duration=?, verification_url=? WHERE id=?';

        const params = pdfPath
            ? [title, issuer, from_date, to_date, duration, pdfPath, verification_url || '', id]
            : [title, issuer, from_date, to_date, duration, verification_url || '', id];

        await pool.execute(updateQuery, params);

        await logActivity(req.session.adminId, 'CERTIFICATE_UPDATE', `Updated certificate ID: ${id}`, req.ip);
        res.json({ success: true, message: 'Certificate updated successfully' });
    } catch (err) {
        console.error('Update certificate error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

app.delete('/api/certificates/:id', requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        await pool.execute('DELETE FROM certificates WHERE id=?', [id]);
        await logActivity(req.session.adminId, 'CERTIFICATE_DELETE', `Deleted certificate ID: ${id}`, req.ip);
        res.json({ success: true, message: 'Certificate deleted successfully' });
    } catch (err) {
        console.error('Delete certificate error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ============================================
// MESSAGES ROUTES
// ============================================

app.get('/api/messages', requireAuth, async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM messages ORDER BY created_at DESC');
        res.json(rows);
    } catch (err) {
        console.error('Get messages error:', err);
        res.status(500).json([]);
    }
});

app.post('/api/contact', async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        await pool.execute(
            'INSERT INTO messages (name, email, subject, message, ip_address) VALUES (?, ?, ?, ?, ?)',
            [name, email, subject || 'No subject', message, req.ip]
        );

        res.json({ success: true, message: 'Message sent successfully!' });
    } catch (err) {
        console.error('Contact form error:', err);
        res.status(500).json({ success: false, message: 'Failed to send message' });
    }
});

app.delete('/api/messages/:id', requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        await pool.execute('DELETE FROM messages WHERE id=?', [id]);
        res.json({ success: true, message: 'Message deleted successfully' });
    } catch (err) {
        console.error('Delete message error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ============================================
// DASHBOARD STATS
// ============================================

app.get('/api/dashboard', requireAuth, async (req, res) => {
    try {
        const [stats] = await pool.execute('SELECT * FROM vw_dashboard_stats LIMIT 1');
        res.json(stats[0] || {});
    } catch (err) {
        console.error('Dashboard stats error:', err);
        res.status(500).json({});
    }
});

// ============================================
// RESUME ROUTES
// ============================================

app.post('/api/resume', requireAuth, upload.single('resume'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        const resumePath = `/uploads/resumes/${req.file.filename}`;

        // Check if profile exists
        const [profiles] = await pool.execute('SELECT id FROM profile LIMIT 1');

        if (profiles.length === 0) {
            // Create a default profile if it doesn't exist
            await pool.execute(
                'INSERT INTO profile (name, title, resume_path) VALUES (?, ?, ?)',
                ['Your Name', 'Your Title', resumePath]
            );
        } else {
            // Update existing profile
            await pool.execute(
                'UPDATE profile SET resume_path = ? WHERE id = ?',
                [resumePath, profiles[0].id]
            );
        }

        await logActivity(req.session.adminId, 'RESUME_UPLOAD', 'Resume uploaded', req.ip);
        res.json({ success: true, message: 'Resume uploaded successfully', path: resumePath });
    } catch (err) {
        console.error('Resume upload error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

app.delete('/api/resume', requireAuth, async (req, res) => {
    try {
        // Update all profiles (there should only be one anyway)
        await pool.execute('UPDATE profile SET resume_path = NULL');

        await logActivity(req.session.adminId, 'RESUME_DELETE', 'Resume deleted', req.ip);
        res.json({ success: true, message: 'Resume deleted successfully' });
    } catch (err) {
        console.error('Resume delete error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ============================================
// START SERVER
// ============================================

app.listen(PORT, () => {
    console.log('\n╔══════════════════════════════════════╗');
    console.log('║   Portfolio Server Running! 🚀       ║');
    console.log('╚══════════════════════════════════════╝');
    console.log(`\n🌐 Portfolio: http://localhost:${PORT}`);
    console.log(`🔐 Admin: http://localhost:${PORT}/admin.html`);
    console.log('\n📊 Database: MySQL (portfolio_db)');
    console.log('🔒 Security: Enabled');
    console.log('📁 Uploads: Enabled\n');
    console.log('Default Admin Credentials:');
    console.log('  Username: admin');
    console.log('  Password: admin123\n');
    console.log('Press Ctrl+C to stop the server\n');
});
