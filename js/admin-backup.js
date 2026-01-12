// ===================================
// ADMIN PANEL - STREAMLINED FOR FRESHERS
// ===================================

const API_URL = 'http://localhost:3000/api';

// Default admin credentials
const DEFAULT_CREDENTIALS = {
    username: 'admin',
    password: 'admin123'
};

// ===================================
// AUTHENTICATION
// ===================================

class Auth {
    constructor() {
        this.token = localStorage.getItem('adminToken');
        this.checkAuth();
    }

    checkAuth() {
        const loginScreen = document.getElementById('loginScreen');
        const dashboard = document.getElementById('adminDashboard');

        if (this.token) {
            loginScreen.style.display = 'none';
            dashboard.style.display = 'grid';
        } else {
            loginScreen.style.display = 'flex';
            dashboard.style.display = 'none';
        }
    }

    async login(username, password) {
        if (username === DEFAULT_CREDENTIALS.username && password === DEFAULT_CREDENTIALS.password) {
            const token = btoa(`${username}:${Date.now()}`);
            localStorage.setItem('adminToken', token);
            this.token = token;
            this.checkAuth();
            return true;
        }
        return false;
    }

    logout() {
        localStorage.removeItem('adminToken');
        this.token = null;
        this.checkAuth();
    }
}

// ===================================
// DATA STORAGE
// ===================================

class DataStore {
    constructor() {
        this.initializeData();
    }

    initializeData() {
        if (!localStorage.getItem('portfolioData')) {
            const defaultData = {
                profile: {
                    name: 'Your Name',
                    title: 'Backend Engineer',
                    punchline: 'Building scalable backend systems with Java & Spring Boot.',
                    about: `I'm a passionate Backend Engineer with a deep focus on building robust, scalable systems using Java and Spring Boot.\n\nMy journey in software development began with a fascination for how things work behind the scenes.`,
                    email: 'your.email@example.com',
                    phone: '+1 (234) 567-890',
                    location: 'Your City, Country',
                    image: 'assets/profile.jpg',
                    projectsCount: '0',
                    certificatesCount: '0'
                },
                skills: [],
                projects: [],
                certificates: [],
                messages: []
            };
            localStorage.setItem('portfolioData', JSON.stringify(defaultData));
        }
    }

    getData(key) {
        const data = JSON.parse(localStorage.getItem('portfolioData'));
        return key ? data[key] : data;
    }

    setData(key, value) {
        const data = this.getData();
        data[key] = value;

        // Update counts
        if (key === 'projects') {
            data.profile.projectsCount = value.length;
        }
        if (key === 'certificates') {
            data.profile.certificatesCount = value.length;
        }

        localStorage.setItem('portfolioData', JSON.stringify(data));
    }

    addItem(key, item) {
        const items = this.getData(key);
        item.id = Date.now();
        items.push(item);
        this.setData(key, items);
        return item;
    }

    updateItem(key, id, updatedItem) {
        const items = this.getData(key);
        const index = items.findIndex(item => item.id == id);
        if (index !== -1) {
            items[index] = { ...items[index], ...updatedItem, id };
            this.setData(key, items);
        }
    }

    deleteItem(key, id) {
        const items = this.getData(key);
        const filtered = items.filter(item => item.id != id);
        this.setData(key, filtered);
    }
}

// ===================================
// IMAGE HANDLER WITH CROPPING
// ===================================

class ImageHandler {
    static handleImageUpload(input, callback) {
        const file = input.files[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                // Show simple crop modal
                this.showCropModal(e.target.result, callback);
            };
            reader.readAsDataURL(file);
        } else {
            alert('Please select a valid image file');
        }
    }

    static showCropModal(imageDataUrl, callback) {
        const modal = document.createElement('div');
        modal.id = 'cropModal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.95);
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 2rem;
        `;

        modal.innerHTML = `
            <div style="background: var(--color-bg-card); padding: 2rem; border-radius: 1rem; max-width: 600px; width: 100%;">
                <h3 style="margin-bottom: 1rem; color: var(--color-text-primary);">Crop & Edit Image</h3>
                <div style="text-align: center; margin-bottom: 1rem;">
                    <img id="cropImage" src="${imageDataUrl}" style="max-width: 100%; max-height: 400px; border-radius: 0.5rem;">
                </div>
                <div style="margin-bottom: 1rem;">
                    <label style="color: var(--color-text-secondary); display: block; margin-bottom: 0.5rem;">Brightness</label>
                    <input type="range" id="brightness" min="50" max="150" value="100" style="width: 100%;">
                </div>
                <div style="margin-bottom: 1rem;">
                    <label style="color: var(--color-text-secondary); display: block; margin-bottom: 0.5rem;">Contrast</label>
                    <input type="range" id="contrast" min="50" max="150" value="100" style="width: 100%;">
                </div>
                <div style="display: flex; gap: 1rem; justify-content: flex-end;">
                    <button class="btn btn-outline" id="cropCancel">Cancel</button>
                    <button class="btn btn-primary" id="cropDone">
                        <i class="fas fa-check"></i> Use Image
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        const img = document.getElementById('cropImage');
        const brightnessInput = document.getElementById('brightness');
        const contrastInput = document.getElementById('contrast');

        function applyFilters() {
            const brightness = brightnessInput.value;
            const contrast = contrastInput.value;
            img.style.filter = `brightness(${brightness}%) contrast(${contrast}%)`;
        }

        brightnessInput.addEventListener('input', applyFilters);
        contrastInput.addEventListener('input', applyFilters);

        document.getElementById('cropDone').onclick = () => {
            // Create canvas to apply filters
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const tempImg = new Image();

            tempImg.onload = () => {
                canvas.width = tempImg.width;
                canvas.height = tempImg.height;

                // Apply filters
                ctx.filter = `brightness(${brightnessInput.value}%) contrast(${contrastInput.value}%)`;
                ctx.drawImage(tempImg, 0, 0);

                const editedImage = canvas.toDataURL('image/jpeg', 0.9);
                callback(editedImage);
                modal.remove();
            };

            tempImg.src = imageDataUrl;
        };

        document.getElementById('cropCancel').onclick = () => modal.remove();
    }
}

// ===================================
// ADMIN DASHBOARD
// ===================================

class AdminDashboard {
    constructor() {
        this.auth = new Auth();
        this.store = new DataStore();
        this.currentSection = 'dashboard';
        this.editingId = null;

        if (this.auth.token) {
            this.init();
        }
    }

    init() {
        this.setupEventListeners();
        this.loadDashboard();
        this.loadProfile();
    }

    setupEventListeners() {
        // Login form
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        // Logout
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.auth.logout());
        }

        // Navigation
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', (e) => this.handleNavigation(e));
        });

        // Add buttons
        document.getElementById('addProjectBtn')?.addEventListener('click', () => this.showProjectModal());
        document.getElementById('addCertificateBtn')?.addEventListener('click', () => this.showCertificateModal());
        document.getElementById('addSkillCategoryBtn')?.addEventListener('click', () => this.showSkillModal());

        // Profile form
        document.getElementById('profileForm')?.addEventListener('submit', (e) => this.saveProfile(e));

        // Profile image upload
        document.getElementById('profileImageUpload')?.addEventListener('change', (e) => this.handleProfileImageUpload(e));

        // Modal close
        document.getElementById('modalClose')?.addEventListener('click', () => this.closeModal());
        document.getElementById('modal')?.addEventListener('click', (e) => {
            if (e.target.id === 'modal') this.closeModal();
        });

        // Resume upload
        const resumeUploadArea = document.getElementById('resumeUploadArea');
        const resumeInput = document.getElementById('resumeInput');

        resumeUploadArea?.addEventListener('click', () => resumeInput.click());
        resumeInput?.addEventListener('change', (e) => this.handleResumeUpload(e));
    }

    handleProfileImageUpload(e) {
        const file = e.target.files[0];
        if (file) {
            ImageHandler.handleImageUpload(e.target, (editedImage) => {
                // Update hidden input and preview
                document.getElementById('profileImageData').value = editedImage;
                const preview = document.getElementById('profileImagePreview');
                preview.innerHTML = `<img src="${editedImage}" style="max-width: 200px; border-radius: 50%; margin-top: 1rem;">`;
            });
        }
    }

    async handleLogin(e) {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const errorDiv = document.getElementById('loginError');

        const success = await this.auth.login(username, password);

        if (success) {
            this.init();
        } else {
            errorDiv.textContent = 'Invalid username or password';
            errorDiv.classList.add('show');
            setTimeout(() => errorDiv.classList.remove('show'), 3000);
        }
    }

    handleNavigation(e) {
        e.preventDefault();
        const section = e.currentTarget.dataset.section;

        // Update active nav item
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        e.currentTarget.classList.add('active');

        // Update section
        document.querySelectorAll('.admin-section').forEach(sec => {
            sec.classList.remove('active');
        });
        document.getElementById(`section-${section}`)?.classList.add('active');

        // Update title
        document.getElementById('sectionTitle').textContent =
            section.charAt(0).toUpperCase() + section.slice(1);

        this.currentSection = section;
        this.loadSectionData(section);
    }

    loadSectionData(section) {
        switch (section) {
            case 'dashboard':
                this.loadDashboard();
                break;
            case 'profile':
                this.loadProfile();
                break;
            case 'skills':
                this.loadSkills();
                break;
            case 'projects':
                this.loadProjects();
                break;
            case 'certificates':
                this.loadCertificates();
                break;
            case 'messages':
                this.loadMessages();
                break;
            case 'resume':
                this.loadResume();
                break;
        }
    }

    loadDashboard() {
        const data = this.store.getData();

        document.getElementById('totalProjects').textContent = data.projects.length;
        document.getElementById('totalCertificates').textContent = data.certificates.length;
        document.getElementById('totalMessages').textContent = data.messages.length;
        document.getElementById('messageCount').textContent = data.messages.length;

        const activityList = document.getElementById('activityList');
        const activities = [
            { icon: 'fa-folder', title: `${data.projects.length} Projects`, time: 'Total' },
            { icon: 'fa-certificate', title: `${data.certificates.length} Certificates`, time: 'Total' },
            { icon: 'fa-envelope', title: `${data.messages.length} Messages`, time: 'Total' }
        ];

        activityList.innerHTML = activities.map(activity => `
            <div class="activity-item">
                <div class="activity-icon">
                    <i class="fas ${activity.icon}"></i>
                </div>
                <div class="activity-info">
                    <h4>${activity.title}</h4>
                    <p>${activity.time}</p>
                </div>
            </div>
        `).join('');
    }

    loadProfile() {
        const profile = this.store.getData('profile');

        document.getElementById('profileName').value = profile.name || '';
        document.getElementById('profileTitle').value = profile.title || '';
        document.getElementById('profilePunchline').value = profile.punchline || '';
        document.getElementById('profileAbout').value = profile.about || '';
        document.getElementById('profileEmail').value = profile.email || '';
        document.getElementById('profilePhone').value = profile.phone || '';
        document.getElementById('profileLocation').value = profile.location || '';
        document.getElementById('profileImageData').value = profile.image || '';

        if (profile.image && profile.image.startsWith('data:')) {
            document.getElementById('profileImagePreview').innerHTML =
                `<img src="${profile.image}" style="max-width: 200px; border-radius: 50%; margin-top: 1rem;">`;
        }
    }

    saveProfile(e) {
        e.preventDefault();

        const profile = {
            name: document.getElementById('profileName').value,
            title: document.getElementById('profileTitle').value,
            punchline: document.getElementById('profilePunchline').value,
            about: document.getElementById('profileAbout').value,
            email: document.getElementById('profileEmail').value,
            phone: document.getElementById('profilePhone').value,
            location: document.getElementById('profileLocation').value,
            image: document.getElementById('profileImageData').value || 'assets/profile.jpg',
            projectsCount: this.store.getData('projects').length,
            certificatesCount: this.store.getData('certificates').length
        };

        this.store.setData('profile', profile);
        this.showNotification('Profile updated successfully!');
    }

    loadSkills() {
        const skills = this.store.getData('skills');
        const container = document.getElementById('skillsList');

        if (skills.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: var(--color-text-secondary);">No skills added yet. Click "Add Category" to get started.</p>';
            return;
        }

        container.innerHTML = skills.map(category => `
            <div class="item-card">
                <div class="item-info">
                    <h3>${category.icon} ${category.category}</h3>
                    <p>${category.skills.length} skills</p>
                </div>
                <div class="item-actions">
                    <button class="btn-icon" onclick="window.adminDashboard.editSkillCategory(${category.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon delete" onclick="window.adminDashboard.deleteSkillCategory(${category.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');

        if (certificates.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: var(--color-text-secondary);">No certificates added yet. Click "Add Certificate" to get started.</p>';
            return;
        }

        container.innerHTML = certificates.map(cert => `
            <div class="item-card">
                <div class="item-info">
                    <h3>${cert.title}</h3>
                    <p>${cert.issuer} • ${cert.date}</p>
                </div>
                <div class="item-actions">
                    <button class="btn-icon" onclick="window.adminDashboard.editCertificate(${cert.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon delete" onclick="window.adminDashboard.deleteCertificate(${cert.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    loadMessages() {
        const messages = this.store.getData('messages');
        const container = document.getElementById('messagesList');

        if (messages.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: var(--color-text-secondary);">No messages yet</p>';
            return;
        }

        container.innerHTML = messages.map(msg => `
            <div class="message-card">
                <div class="message-header">
                    <div class="message-sender">
                        <h3>${msg.name}</h3>
                        <p>${msg.email}</p>
                    </div>
                    <div class="message-date">${new Date(msg.date).toLocaleDateString()}</div>
                </div>
                <div class="message-subject">${msg.subject}</div>
                <div class="message-body">${msg.message}</div>
            </div>
        `).join('');
    }

    loadResume() {
        const resume = localStorage.getItem('resume');
        const container = document.getElementById('currentResume');

        if (resume) {
            container.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <h4>Current Resume</h4>
                        <p style="color: var(--color-text-secondary); margin: 0;">resume.pdf</p>
                    </div>
                    <div style="display: flex; gap: 1rem;">
                        <a href="${resume}" download="resume.pdf" class="btn btn-primary">
                            <i class="fas fa-download"></i> Download
                        </a>
                        <button class="btn btn-outline" onclick="window.adminDashboard.deleteResume()">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </div>
            `;
        } else {
            container.innerHTML = '<p style="color: var(--color-text-secondary);">No resume uploaded</p>';
        }
    }

    handleResumeUpload(e) {
        const file = e.target.files[0];
        if (file && file.type === 'application/pdf') {
            const reader = new FileReader();
            reader.onload = (event) => {
                localStorage.setItem('resume', event.target.result);
                this.showNotification('Resume uploaded successfully!');
                this.loadResume();
            };
            reader.readAsDataURL(file);
        } else {
            alert('Please upload a PDF file');
        }
    }

    deleteResume() {
        if (confirm('Are you sure you want to delete the resume?')) {
            localStorage.removeItem('resume');
            this.loadResume();
            this.showNotification('Resume deleted');
        }
    }

    // Modal functions
    showProjectModal(id = null) {
        const modal = document.getElementById('modal');
        const modalTitle = document.getElementById('modalTitle');
        const modalBody = document.getElementById('modalBody');

        this.editingId = id;
        modalTitle.textContent = id ? 'Edit Project' : 'Add Project';

        const project = id ? this.store.getData('projects').find(p => p.id == id) : {};

        modalBody.innerHTML = `
            <form id="itemForm" class="admin-form">
                <div class="form-group">
                    <label>Title</label>
                    <input type="text" name="title" value="${project.title || ''}" required>
                </div>
                <div class="form-group">
                    <label>Description</label>
                    <textarea name="description" rows="4" required>${project.description || ''}</textarea>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Status</label>
                        <select name="status" required>
                            <option value="completed" ${project.status === 'completed' ? 'selected' : ''}>Completed</option>
                            <option value="development" ${project.status === 'development' ? 'selected' : ''}>In Development</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Image</label>
                        <input type="file" name="image" accept="image/*" id="imageInput">
                        <small style="color: var(--color-text-tertiary);">Current: ${project.image || 'None'}</small>
                    </div>
                </div>
                <div class="form-group">
                    <label>Technologies (comma-separated)</label>
                    <input type="text" name="tech" value="${project.tech?.join(', ') || ''}" required>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>GitHub Link</label>
                        <input type="url" name="github" value="${project.github || ''}">
                    </div>
                    <div class="form-group">
                        <label>Demo Link</label>
                        <input type="url" name="demo" value="${project.demo || ''}">
                    </div>
                </div>
                <button type="submit" class="btn btn-primary">
                    <i class="fas fa-save"></i> Save Project
                </button>
            </form>
        `;

        document.getElementById('itemForm').addEventListener('submit', (e) => this.saveProject(e));
        modal.classList.add('show');
    }

    saveProject(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const imageInput = document.getElementById('imageInput');

        const saveData = (imageUrl) => {
            const data = {
                title: formData.get('title'),
                description: formData.get('description'),
                status: formData.get('status'),
                image: imageUrl || 'assets/placeholder.jpg',
                tech: formData.get('tech').split(',').map(t => t.trim()),
                github: formData.get('github') || '#',
                demo: formData.get('demo') || '#'
            };

            if (this.editingId) {
                this.store.updateItem('projects', this.editingId, data);
            } else {
                this.store.addItem('projects', data);
            }

            this.closeModal();
            this.loadProjects();
            this.loadDashboard();
            this.showNotification('Project saved successfully!');
        };

        if (imageInput.files[0]) {
            ImageHandler.handleImageUpload(imageInput, saveData);
        } else {
            const existing = this.editingId ? this.store.getData('projects').find(p => p.id == this.editingId) : {};
            saveData(existing.image);
        }
    }

    showCertificateModal(id = null) {
        const modal = document.getElementById('modal');
        const modalTitle = document.getElementById('modalTitle');
        const modalBody = document.getElementById('modalBody');

        this.editingId = id;
        modalTitle.textContent = id ? 'Edit Certificate' : 'Add Certificate';

        const cert = id ? this.store.getData('certificates').find(c => c.id == id) : {};

        modalBody.innerHTML = `
            <form id="itemForm" class="admin-form">
                <div class="form-group">
                    <label>Certificate Title</label>
                    <input type="text" name="title" value="${cert.title || ''}" required>
                </div>
                <div class="form-group">
                    <label>Issuer/Organization</label>
                    <input type="text" name="issuer" value="${cert.issuer || ''}" required>
                </div>
                <div class="form-group">
                    <label>Date</label>
                    <input type="text" name="date" value="${cert.date || ''}" placeholder="Dec 2024" required>
                </div>
                <div class="form-group">
                    <label>Certificate Image</label>
                    <input type="file" name="image" accept="image/*" id="imageInput">
                    <small style="color: var(--color-text-tertiary);">Current: ${cert.image || 'None'}</small>
                </div>
                <div class="form-group">
                    <label>Verification Link (optional)</label>
                    <input type="url" name="link" value="${cert.link || ''}">
                </div>
                <button type="submit" class="btn btn-primary">
                    <i class="fas fa-save"></i> Save Certificate
                </button>
            </form>
        `;

        document.getElementById('itemForm').addEventListener('submit', (e) => this.saveCertificate(e));
        modal.classList.add('show');
    }

    saveCertificate(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const imageInput = document.getElementById('imageInput');

        const saveData = (imageUrl) => {
            const data = {
                title: formData.get('title'),
                issuer: formData.get('issuer'),
                date: formData.get('date'),
                image: imageUrl || 'assets/placeholder.jpg',
                link: formData.get('link') || '#'
            };

            if (this.editingId) {
                this.store.updateItem('certificates', this.editingId, data);
            } else {
                this.store.addItem('certificates', data);
            }

            this.closeModal();
            this.loadCertificates();
            this.loadDashboard();
            this.showNotification('Certificate saved successfully!');
        };

        if (imageInput.files[0]) {
            ImageHandler.handleImageUpload(imageInput, saveData);
        } else {
            const existing = this.editingId ? this.store.getData('certificates').find(c => c.id == this.editingId) : {};
            saveData(existing.image);
        }
    }

    showSkillModal(id = null) {
        const modal = document.getElementById('modal');
        const modalTitle = document.getElementById('modalTitle');
        const modalBody = document.getElementById('modalBody');

        this.editingId = id;
        modalTitle.textContent = id ? 'Edit Skill Category' : 'Add Skill Category';

        const category = id ? this.store.getData('skills').find(s => s.id == id) : {};

        modalBody.innerHTML = `
            <form id="itemForm" class="admin-form">
                <div class="form-row">
                    <div class="form-group">
                        <label>Category Name</label>
                        <input type="text" name="category" value="${category.category || ''}" placeholder="e.g., Backend" required>
                    </div>
                    <div class="form-group">
                        <label>Icon (emoji)</label>
                        <input type="text" name="icon" value="${category.icon || ''}" placeholder="⚙️" required>
                    </div>
                </div>
                <div class="form-group">
                    <label>Skills (one per line: name, level, icon)</label>
                    <textarea name="skills" rows="6" placeholder="Java, Expert, ☕\nSpring Boot, Expert, 🍃" required>${category.skills?.map(s => `${s.name}, ${s.level}, ${s.icon}`).join('\n') || ''}</textarea>
                    <small style="color: var(--color-text-tertiary);">Format: Name, Level, Icon (emoji)</small>
                </div>
                <button type="submit" class="btn btn-primary">
                    <i class="fas fa-save"></i> Save Category
                </button>
            </form>
        `;

        document.getElementById('itemForm').addEventListener('submit', (e) => this.saveSkill(e));
        modal.classList.add('show');
    }

    saveSkill(e) {
        e.preventDefault();
        const formData = new FormData(e.target);

        const skillsText = formData.get('skills');
        const skills = skillsText.split('\n').filter(line => line.trim()).map(line => {
            const [name, level, icon] = line.split(',').map(s => s.trim());
            return { name, level, icon };
        });

        const data = {
            category: formData.get('category'),
            icon: formData.get('icon'),
            skills: skills
        };

        if (this.editingId) {
            this.store.updateItem('skills', this.editingId, data);
        } else {
            this.store.addItem('skills', data);
        }

        this.closeModal();
        this.loadSkills();
        this.showNotification('Skill category saved successfully!');
    }

    // Edit functions
    editProject(id) {
        this.showProjectModal(id);
    }

    editCertificate(id) {
        this.showCertificateModal(id);
    }

    editSkillCategory(id) {
        this.showSkillModal(id);
    }

    // Delete functions
    deleteProject(id) {
        if (confirm('Are you sure you want to delete this project?')) {
            this.store.deleteItem('projects', id);
            this.loadProjects();
            this.loadDashboard();
            this.showNotification('Project deleted');
        }
    }

    deleteCertificate(id) {
        if (confirm('Are you sure you want to delete this certificate?')) {
            this.store.deleteItem('certificates', id);
            this.loadCertificates();
            this.loadDashboard();
            this.showNotification('Certificate deleted');
        }
    }

    deleteSkillCategory(id) {
        if (confirm('Are you sure you want to delete this skill category?')) {
            this.store.deleteItem('skills', id);
            this.loadSkills();
            this.showNotification('Skill category deleted');
        }
    }

    closeModal() {
        document.getElementById('modal').classList.remove('show');
        this.editingId = null;
    }

    showNotification(message) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--gradient-primary);
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 0.5rem;
            box-shadow: var(--shadow-lg);
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Initialize admin dashboard and make it globally accessible
window.adminDashboard = null;
document.addEventListener('DOMContentLoaded', () => {
    window.adminDashboard = new AdminDashboard();
});
