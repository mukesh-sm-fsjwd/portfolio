# Portfolio Website

A modern, full-stack portfolio website built with Node.js/Express backend and vanilla JavaScript frontend.

## 🚀 Features

- **Dynamic Content Management** - Admin panel to manage projects, skills, certificates, and profile
- **Modern UI/UX** - Responsive design with smooth animations
- **Contact Form** - Integrated contact form with email notifications
- **Certificate Management** - Upload and display certificates with PDF preview
- **Skills Showcase** - Infinite scroll animation for skills display
- **Resume Management** - Upload and manage resume
- **Secure Admin Panel** - Protected admin routes with session authentication

## 🛠️ Tech Stack

### Backend
- Node.js (v14+)
- Express.js
- MySQL Database
- bcrypt (password hashing)
- express-session (authentication)
- multer (file uploads)
- helmet (security)
- express-rate-limit (rate limiting)

### Frontend
- HTML5, CSS3, JavaScript (ES6+)
- AOS (Animate On Scroll)
- Font Awesome Icons
- Responsive Design (Mobile-first)

## 📋 Prerequisites

- Node.js 14 or higher
- MySQL 8.0 or higher
- WAMP/XAMPP (for local MySQL)
- npm (comes with Node.js)

## 🔧 Installation

### 1. Clone the Repository
```bash
git clone https://github.com/YOUR_USERNAME/portfolio.git
cd portfolio
```

### 2. Database Setup
1. Start WAMP/XAMPP
2. Create database:
```sql
CREATE DATABASE portfolio_db;
```

3. Update `.env` file with your database credentials:
```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=portfolio_db
DB_USER=root
DB_PASSWORD=your_password
SESSION_SECRET=your_secret_key_here
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Run the Application
```bash
node server.js
```

The application will start on `http://localhost:3000`

## 📱 Usage

### Admin Panel
- Access: `http://localhost:3000/admin.html`
- Default credentials:
  - Username: `admin`
  - Password: `admin123`

**⚠️ IMPORTANT:** Change these credentials immediately after first login!

### Managing Content
1. **Profile** - Update your personal information
2. **Skills** - Add/edit/delete skills by category
3. **Projects** - Showcase your projects with images and links
4. **Certificates** - Upload certificates with PDF preview
5. **Messages** - View contact form submissions
6. **Resume** - Upload your resume PDF

## 🔒 Security

### Before Hosting:
1. **Change Admin Credentials** - Update in database
2. **Update .env** - Use strong SESSION_SECRET
3. **Enable HTTPS** - Use SSL certificate
4. **Secure Database** - Use strong password
5. **Environment Variables** - Never commit .env to Git

## 📁 Project Structure

```
portfolio/
├── css/                    # Stylesheets
├── js/                     # JavaScript files
├── uploads/               # User uploaded files
│   ├── projects/         # Project images
│   ├── certificates/     # Certificate PDFs
│   └── resumes/          # Resume PDFs
├── server.js             # Backend server
├── index.html            # Main portfolio page
├── admin.html            # Admin panel
├── .env                  # Environment variables (DO NOT COMMIT)
├── .gitignore           # Git ignore file
└── package.json         # Dependencies
```

## 🌐 Deployment

### Recommended Hosting Platforms:
- **Render** (Free tier available)
- **Railway** (Free tier available)
- **Heroku** (Paid)
- **DigitalOcean** (Paid)

### Steps:
1. Push code to GitHub
2. Connect repository to hosting platform
3. Set environment variables
4. Deploy!

See `DEPLOYMENT.md` for detailed deployment guide.

## 🤝 Contributing

This is a personal portfolio project. Feel free to fork and customize for your own use!

## 📄 License

MIT License - Feel free to use this project for your own portfolio.

## 👤 Author

**Mukesh SM**
- GitHub: [@mukesh-sm-fsjwd](https://github.com/mukesh-sm-fsjwd)
- LinkedIn: [mukesh-sm-fsjwd](https://linkedin.com/in/mukesh-sm-fsjwd)

## 🙏 Acknowledgments

- Font Awesome for icons
- AOS library for animations
- All open-source contributors

---

**Made with ❤️ by Mukesh SM**
