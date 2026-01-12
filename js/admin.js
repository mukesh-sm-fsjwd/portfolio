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
        this.checkAuth();
    }

    async checkAuth() {
        try {
            const response = await fetch(`${API_URL}/check-auth`, {
                credentials: 'include'
            });
            const data = await response.json();

            const loginScreen = document.getElementById('loginScreen');
            const dashboard = document.getElementById('adminDashboard');

            if (data.authenticated) {
                loginScreen.style.display = 'none';
                dashboard.style.display = 'grid';
                return true;
            } else {
                loginScreen.style.display = 'flex';
                dashboard.style.display = 'none';
                return false;
            }
        } catch (err) {
            console.error('Auth check error:', err);
            const loginScreen = document.getElementById('loginScreen');
            const dashboard = document.getElementById('adminDashboard');
            loginScreen.style.display = 'flex';
            dashboard.style.display = 'none';
            return false;
        }
    }

    async login(username, password) {
        try {
            const response = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (data.success) {
                await this.checkAuth();
                return true;
            } else {
                alert(data.message || 'Login failed');
                return false;
            }
        } catch (err) {
            console.error('Login error:', err);
            alert('Login failed. Please try again.');
            return false;
        }
    }

    async logout() {
        try {
            await fetch(`${API_URL}/logout`, {
                method: 'POST',
                credentials: 'include'
            });
            await this.checkAuth();
        } catch (err) {
            console.error('Logout error:', err);
        }
    }
}

// ===================================
// DATA STORAGE
// ===================================

class DataStore {
    constructor() {
        // No initialization needed - using MySQL API
    }

    async getData(key) {
        try {
            const response = await fetch(`${API_URL}/${key}`, {
                credentials: 'include'
            });
            if (!response.ok) throw new Error('Failed to fetch');
            return await response.json();
        } catch (err) {
            console.error(`Error getting ${key}:`, err);
            return [];
        }
    }

    async setData(key, value) {
        try {
            const response = await fetch(`${API_URL}/${key}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(value)
            });
            return await response.json();
        } catch (err) {
            console.error(`Error setting ${key}:`, err);
            return { success: false };
        }
    }

    async addItem(key, item) {
        try {
            const response = await fetch(`${API_URL}/${key}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(item)
            });
            const data = await response.json();
            if (data.success) {
                return data.id;
            }
            return null;
        } catch (err) {
            console.error(`Error adding ${key}:`, err);
            return null;
        }
    }

    async updateItem(key, id, updatedItem) {
        try {
            const response = await fetch(`${API_URL}/${key}/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(updatedItem)
            });
            return await response.json();
        } catch (err) {
            console.error(`Error updating ${key}:`, err);
            return { success: false };
        }
    }

    async deleteItem(key, id) {
        try {
            const response = await fetch(`${API_URL}/${key}/${id}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            return await response.json();
        } catch (err) {
            console.error(`Error deleting ${key}:`, err);
            return { success: false };
        }
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

        // Setup event listeners immediately
        this.setupEventListeners();
    }

    // Custom confirmation modal
    showConfirm(message, title = 'Confirm Action', type = 'danger') {
        return new Promise((resolve) => {
            // Create modal HTML
            const iconClass = type === 'danger' ? 'fas fa-exclamation-triangle' :
                type === 'warning' ? 'fas fa-exclamation-circle' :
                    'fas fa-info-circle';

            const modalHTML = `
                <div class="confirm-modal-overlay" id="confirmModalOverlay">
                    <div class="confirm-modal">
                        <div class="confirm-modal-header">
                            <div class="confirm-modal-icon ${type}">
                                <i class="${iconClass}"></i>
                            </div>
                            <h3 class="confirm-modal-title">${title}</h3>
                        </div>
                        <div class="confirm-modal-message">${message}</div>
                        <div class="confirm-modal-actions">
                            <button class="confirm-btn confirm-btn-cancel" id="confirmCancel">
                                Cancel
                            </button>
                            <button class="confirm-btn confirm-btn-confirm" id="confirmOk">
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            `;

            // Add to body
            document.body.insertAdjacentHTML('beforeend', modalHTML);

            const overlay = document.getElementById('confirmModalOverlay');
            const cancelBtn = document.getElementById('confirmCancel');
            const okBtn = document.getElementById('confirmOk');

            // Handle confirm
            okBtn.addEventListener('click', () => {
                overlay.remove();
                resolve(true);
            });

            // Handle cancel
            const handleCancel = () => {
                overlay.remove();
                resolve(false);
            };

            cancelBtn.addEventListener('click', handleCancel);
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) handleCancel();
            });

            // ESC key to cancel
            const handleEsc = (e) => {
                if (e.key === 'Escape') {
                    handleCancel();
                    document.removeEventListener('keydown', handleEsc);
                }
            };
            document.addEventListener('keydown', handleEsc);
        });
    }

    async init() {
        // Check if authenticated
        const isAuth = await this.auth.checkAuth();
        if (isAuth) {
            this.loadDashboard();
            this.loadProfile();
            this.updateMessageBadge(); // Update badge immediately on init
        }
    }

    // Update message badge without loading full message list
    async updateMessageBadge() {
        try {
            const messages = await this.store.getData('messages');
            const messageBadge = document.getElementById('messageCount');
            const messagesNavItem = document.querySelector('.nav-item[data-section="messages"]');

            const messageCount = messages ? messages.length : 0;

            if (messageBadge) {
                messageBadge.textContent = messageCount;

                if (messageCount > 0) {
                    messageBadge.classList.add('new-message');
                    setTimeout(() => {
                        messageBadge.classList.remove('new-message');
                    }, 2000);
                }
            }

            if (messagesNavItem) {
                if (messageCount > 0) {
                    messagesNavItem.classList.add('has-new-messages');
                } else {
                    messagesNavItem.classList.remove('has-new-messages');
                }
            }
        } catch (err) {
            console.error('Update message badge error:', err);
        }
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
        document.getElementById('addSkillBtn')?.addEventListener('click', () => this.showAddSkillModal());
        document.getElementById('addSkillCategoryBtn')?.addEventListener('click', () => this.showSkillModal());

        // Profile form
        document.getElementById('profileForm')?.addEventListener('submit', (e) => this.saveProfile(e));

        // Profile image upload
        document.getElementById('profileImageInput')?.addEventListener('change', (e) => this.handleProfileImageUpload(e));

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

    // Animated number counter
    animateNumber(element, target, duration = 1000) {
        const start = 0;
        const increment = target / (duration / 16); // 60fps
        let current = start;

        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                element.textContent = target;
                clearInterval(timer);
            } else {
                element.textContent = Math.floor(current);
            }
        }, 16);
    }

    async loadDashboard() {
        try {
            const response = await fetch(`${API_URL}/dashboard`, { credentials: 'include' });
            const stats = await response.json();

            const totalProjects = document.getElementById('totalProjects');
            const totalCertificates = document.getElementById('totalCertificates');
            const totalMessages = document.getElementById('totalMessages');
            const totalSkills = document.getElementById('totalSkills');

            // Animate numbers instead of just setting them
            if (totalProjects) this.animateNumber(totalProjects, stats.total_projects || 0);
            if (totalCertificates) this.animateNumber(totalCertificates, stats.total_certificates || 0);
            if (totalMessages) this.animateNumber(totalMessages, stats.total_messages || 0);
            if (totalSkills) this.animateNumber(totalSkills, stats.total_skills || 0);
        } catch (err) {
            console.error('Dashboard load error:', err);
        }
    }

    async loadProfile() {
        try {
            const response = await fetch(`${API_URL}/profile`, { credentials: 'include' });
            const profile = await response.json();

            document.getElementById('profileName').value = profile.name || '';
            document.getElementById('profileTitle').value = profile.title || '';
            document.getElementById('profilePunchline').value = profile.punchline || '';
            document.getElementById('profileAbout').value = profile.about || '';
            document.getElementById('profileEmail').value = profile.email || '';
            document.getElementById('profilePhone').value = profile.phone || '';
            document.getElementById('profileLocation').value = profile.location || '';

            if (profile.image_path) {
                const preview = document.getElementById('profileImagePreview');
                if (preview) {
                    preview.innerHTML = `<img src="${profile.image_path}" alt="Profile" style="max-width: 200px; border-radius: 8px;">`;
                }
            }
        } catch (err) {
            console.error('Load profile error:', err);
        }
    }

    async saveProfile(e) {
        e.preventDefault();

        const formData = new FormData();
        formData.append('name', document.getElementById('profileName').value);
        formData.append('title', document.getElementById('profileTitle').value);
        formData.append('punchline', document.getElementById('profilePunchline').value);
        formData.append('about', document.getElementById('profileAbout').value);
        formData.append('email', document.getElementById('profileEmail').value);
        formData.append('phone', document.getElementById('profilePhone').value);
        formData.append('location', document.getElementById('profileLocation').value);

        const imageInput = document.getElementById('profileImageInput');
        if (imageInput?.files[0]) {
            formData.append('profileImage', imageInput.files[0]);
        }

        try {
            const response = await fetch(`${API_URL}/profile`, {
                method: 'POST',
                credentials: 'include',
                body: formData
            });

            const data = await response.json();
            if (data.success) {
                this.showNotification('Profile updated successfully!');
                this.loadProfile();
                this.loadDashboard();
            } else {
                alert('Failed to update profile');
            }
        } catch (err) {
            console.error('Save profile error:', err);
            alert('Error saving profile');
        }
    }

    async loadSkills() {
        try {
            const skills = await this.store.getData('skills');
            const container = document.getElementById('skillsList');

            if (!skills || skills.length === 0) {
                container.innerHTML = '<p style="text-align: center; color: var(--color-text-secondary);">No skills added yet.</p>';
                return;
            }

            // Group skills by category for display
            const grouped = {};
            skills.forEach(skill => {
                if (!grouped[skill.category]) {
                    grouped[skill.category] = [];
                }
                grouped[skill.category].push(skill);
            });

            // Category icons mapping
            const categoryIcons = {
                'Backend': 'fas fa-server',
                'Frontend': 'fas fa-palette',
                'Database': 'fas fa-database',
                'Tools': 'fas fa-tools',
                'Mobile': 'fas fa-mobile-alt',
                'Cloud': 'fas fa-cloud',
                'DevOps': 'fas fa-cogs'
            };

            container.innerHTML = Object.keys(grouped).map(category => `
                <div class="category-group" style="margin-bottom: 2rem;">
                    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem;">
                        <h3 style="color: var(--color-primary); font-size: 1.2rem; margin: 0;">
                            <i class="${categoryIcons[category] || 'fas fa-folder'}"></i> ${category}
                        </h3>
                        <button class="btn-icon btn-danger delete-category-btn" data-category="${category}" title="Delete Category">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                    <div class="skills-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 1rem;">
                        ${grouped[category].map(skill => `
                            <div class="skill-item-card" style="background: var(--color-bg-secondary); padding: 1rem; border-radius: 8px; border: 1px solid var(--color-border);">
                                <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.5rem;">
                                    <i class="${skill.icon || skill.icon_class || 'fas fa-code'}" style="font-size: 1.5rem; color: var(--color-primary);"></i>
                                    <strong style="flex: 1;">${skill.name}</strong>
                                </div>
                                ${skill.level ? `<div style="font-size: 0.85rem; color: var(--color-text-secondary); margin-bottom: 0.5rem;">${skill.level}</div>` : ''}
                                <div style="display: flex; gap: 0.5rem; margin-top: 0.75rem;">
                                    <button class="btn-icon edit-skill-btn" data-skill-id="${skill.id}" title="Edit">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="btn-icon btn-danger delete-skill-btn" data-skill-id="${skill.id}" title="Delete">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `).join('');

            // Add event listeners using event delegation
            container.querySelectorAll('.edit-skill-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const skillId = btn.getAttribute('data-skill-id');
                    this.editSkill(parseInt(skillId));
                });
            });

            container.querySelectorAll('.delete-skill-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const skillId = btn.getAttribute('data-skill-id');
                    this.deleteSkill(parseInt(skillId));
                });
            });

            container.querySelectorAll('.delete-category-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const category = btn.getAttribute('data-category');
                    this.deleteCategory(category);
                });
            });
        } catch (err) {
            console.error('Load skills error:', err);
        }
    }

    async loadCertificates() {
        try {
            const certificates = await this.store.getData('certificates');
            const container = document.getElementById('certificatesList');

            if (!certificates || certificates.length === 0) {
                container.innerHTML = '<p style="text-align: center; color: var(--color-text-secondary);">No certificates added yet.</p>';
                return;
            }

            container.innerHTML = certificates.map(cert => `
            <div class="item-card">
                <div class="item-info">
                    <h3>${cert.title}</h3>
                    <p>${cert.issuer} • ${cert.duration || 'N/A'}</p>
                    <small style="color: var(--color-text-tertiary); display: block; margin-top: 0.5rem;">
                        ${cert.from_date ? new Date(cert.from_date).toLocaleDateString() : ''} - 
                        ${cert.to_date ? new Date(cert.to_date).toLocaleDateString() : ''}
                    </small>
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
        } catch (err) {
            console.error('Load certificates error:', err);
        }
    }

    async loadMessages() {
        try {
            const messages = await this.store.getData('messages');
            const container = document.getElementById('messagesList');

            // Update badge using the dedicated function
            await this.updateMessageBadge();

            if (!messages || messages.length === 0) {
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
                    <div class="message-date">${new Date(msg.created_at || msg.date).toLocaleDateString()}</div>
                </div>
                <div class="message-subject">${msg.subject || 'No subject'}</div>
                <div class="message-body">${msg.message}</div>
                <button class="btn btn-danger" onclick="window.adminDashboard.deleteMessage(${msg.id})">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        `).join('');
        } catch (err) {
            console.error('Load messages error:', err);
        }
    }

    async loadProjects() {
        try {
            const projects = await this.store.getData('projects');
            const container = document.getElementById('projectsList');

            if (!container) return;

            if (!projects || projects.length === 0) {
                container.innerHTML = '<p style="text-align: center; color: var(--color-text-secondary);">No projects added yet.</p>';
                return;
            }

            container.innerHTML = projects.map(project => {
                // Parse technologies
                let techArray = [];
                if (project.technologies) {
                    if (typeof project.technologies === 'string') {
                        try {
                            techArray = JSON.parse(project.technologies);
                        } catch {
                            techArray = project.technologies.split(',').map(t => t.trim()).filter(t => t);
                        }
                    } else if (Array.isArray(project.technologies)) {
                        techArray = project.technologies;
                    }
                } else if (project.tech) {
                    techArray = Array.isArray(project.tech) ? project.tech : [];
                }

                const techDisplay = techArray.length > 0 ? techArray.join(', ') : 'No tech';
                const statusDisplay = project.status === 'completed' ? '✓ Completed' :
                    project.status === 'development' ? '⚡ In Development' :
                        project.status === 'updating' ? '🔄 Updating' :
                            '⚡ In Development';

                return `
                    <div class="item-card">
                        <div class="item-info">
                            <h3>${project.title}</h3>
                            <p>${statusDisplay} • ${techDisplay}</p>
                        </div>
                        <div class="item-actions">
                            <button class="btn-icon" onclick="window.adminDashboard.editProject(${project.id})">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn-icon delete" onclick="window.adminDashboard.deleteProject(${project.id})">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                `;
            }).join('');
        } catch (err) {
            console.error('Load projects error:', err);
        }
    }

    async loadResume() {
        try {
            const profile = await this.store.getData('profile');
            const container = document.getElementById('currentResume');

            if (profile && profile.resume_path) {
                container.innerHTML = `
                    <div class="current-resume-card">
                        <div class="resume-info">
                            <div class="resume-icon">
                                <i class="fas fa-file-pdf"></i>
                            </div>
                            <div class="resume-details">
                                <h4>Current Resume</h4>
                                <p>${profile.resume_path.split('/').pop()}</p>
                                <small>Uploaded resume file</small>
                            </div>
                        </div>
                        <div class="resume-actions">
                            <a href="${profile.resume_path}" target="_blank" class="btn btn-primary">
                                <i class="fas fa-eye"></i> View
                            </a>
                            <a href="${profile.resume_path}" download class="btn btn-secondary">
                                <i class="fas fa-download"></i> Download
                            </a>
                            <button class="btn btn-danger" onclick="admin.deleteResume()">
                                <i class="fas fa-trash"></i> Delete
                            </button>
                        </div>
                    </div>
                `;
            } else {
                container.innerHTML = `
                    <div class="no-resume">
                        <i class="fas fa-file-pdf"></i>
                        <p>No resume uploaded yet</p>
                        <small>Upload a PDF file to get started</small>
                    </div>
                `;
            }
        } catch (err) {
            console.error('Load resume error:', err);
        }
    }

    async handleResumeUpload(e) {
        const file = e.target.files[0];
        if (!file) return;

        if (file.type !== 'application/pdf') {
            alert('Please upload a PDF file only!');
            return;
        }

        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            alert('File size must be less than 5MB!');
            return;
        }

        try {
            const formData = new FormData();
            formData.append('resume', file);

            const response = await fetch(`${API_URL}/resume`, {
                method: 'POST',
                credentials: 'include',
                body: formData
            });

            if (!response.ok) {
                throw new Error('Upload failed');
            }

            const data = await response.json();
            this.showNotification('Resume uploaded successfully!');
            await this.loadResume();
            await this.loadProfile(); // Refresh profile data
        } catch (err) {
            console.error('Resume upload error:', err);
            alert('Failed to upload resume. Please try again.');
        }
    }

    async deleteResume() {
        const confirmed = await this.showConfirm(
            'Your resume will be permanently deleted. This action cannot be undone.',
            'Delete Resume?',
            'danger'
        );
        if (!confirmed) return;

        try {
            const response = await fetch(`${API_URL}/resume`, {
                method: 'DELETE',
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error('Delete failed');
            }

            this.showNotification('Resume deleted successfully!');
            await this.loadResume();
            await this.loadProfile();
        } catch (err) {
            console.error('Delete resume error:', err);
            alert('Failed to delete resume. Please try again.');
        }
    }

    // Modal functions
    async showProjectModal(id = null) {
        const modal = document.getElementById('modal');
        const modalTitle = document.getElementById('modalTitle');
        const modalBody = document.getElementById('modalBody');

        this.editingId = id;
        modalTitle.textContent = id ? 'Edit Project' : 'Add Project';

        // Load technologies from database
        const technologies = await fetch(`${API_URL}/technologies`, { credentials: 'include' })
            .then(res => res.json())
            .catch(err => {
                console.error('Failed to load technologies:', err);
                return [];
            });

        console.log('Loaded technologies:', technologies);

        // Group technologies by category
        const grouped = {
            database: technologies.filter(t => t.category === 'database'),
            language: technologies.filter(t => t.category === 'language'),
            frontend: technologies.filter(t => t.category === 'frontend'),
            backend: technologies.filter(t => t.category === 'backend')
        };

        console.log('Grouped technologies:', grouped);

        let project = {};
        let selectedTech = [];

        if (id) {
            const projects = await this.store.getData('projects');
            project = projects.find(p => p.id == id) || {};

            // Parse technologies from database (could be JSON string or array)
            if (project.technologies) {
                if (typeof project.technologies === 'string') {
                    try {
                        selectedTech = JSON.parse(project.technologies);
                    } catch {
                        selectedTech = project.technologies.split(',').map(t => t.trim()).filter(t => t);
                    }
                } else if (Array.isArray(project.technologies)) {
                    selectedTech = project.technologies;
                }
            } else if (project.tech) {
                selectedTech = Array.isArray(project.tech) ? project.tech : [];
            }

            console.log('Editing project:', project);
            console.log('Selected technologies:', selectedTech);
        }

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
                            <option value="completed" ${project.status === 'completed' ? 'selected' : ''}>✓ Completed</option>
                            <option value="development" ${project.status === 'development' ? 'selected' : ''}>⚡ In Development</option>
                            <option value="updating" ${project.status === 'updating' ? 'selected' : ''}>🔄 Updating</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Image</label>
                        <input type="file" name="image" accept="image/*" id="imageInput">
                        <small style="color: var(--color-text-tertiary);">Current: ${project.image_path ? project.image_path.split('/').pop() : 'None'}</small>
                    </div>
                </div>

                <!-- Technologies Selector -->
                <div class="form-group">
                    <label>Technologies Used</label>
                    
                    <!-- Selected Technologies Display -->
                    <div id="selectedTechTags" class="tech-tags-container" style="min-height: 40px; padding: 10px; background: rgba(255,255,255,0.05); border-radius: 8px; margin-bottom: 15px;">
                        ${selectedTech.map(tech => `
                            <span class="tech-tag" data-tech="${tech}">
                                ${tech} <i class="fas fa-times" onclick="window.adminDashboard.removeTech('${tech}')"></i>
                            </span>
                        `).join('')}
                    </div>

                    <!-- Databases -->
                    <div class="tech-category">
                        <h4 style="font-size: 0.9rem; color: var(--color-neon-blue); margin-bottom: 10px;">
                            <i class="fas fa-database"></i> Databases
                        </h4>
                        <div class="tech-options">
                            ${grouped.database.map(tech => `
                                <button type="button" class="tech-option-btn ${selectedTech.includes(tech.name) ? 'selected' : ''}" 
                                        onclick="window.adminDashboard.toggleTech('${tech.name}')" data-tech="${tech.name}">
                                    <i class="${tech.icon_class}"></i> ${tech.name}
                                </button>
                            `).join('')}
                            <button type="button" class="tech-add-btn" onclick="window.adminDashboard.showAddTechModal('database')">
                                <i class="fas fa-plus"></i> Add Database
                            </button>
                        </div>
                    </div>

                    <!-- Languages -->
                    <div class="tech-category">
                        <h4 style="font-size: 0.9rem; color: var(--color-neon-blue); margin-bottom: 10px;">
                            <i class="fas fa-code"></i> Languages
                        </h4>
                        <div class="tech-options">
                            ${grouped.language.map(tech => `
                                <button type="button" class="tech-option-btn ${selectedTech.includes(tech.name) ? 'selected' : ''}" 
                                        onclick="window.adminDashboard.toggleTech('${tech.name}')" data-tech="${tech.name}">
                                    <i class="${tech.icon_class}"></i> ${tech.name}
                                </button>
                            `).join('')}
                            <button type="button" class="tech-add-btn" onclick="window.adminDashboard.showAddTechModal('language')">
                                <i class="fas fa-plus"></i> Add Language
                            </button>
                        </div>
                    </div>

                    <!-- Frontend -->
                    <div class="tech-category">
                        <h4 style="font-size: 0.9rem; color: var(--color-neon-blue); margin-bottom: 10px;">
                            <i class="fas fa-laptop-code"></i> Frontend Frameworks
                        </h4>
                        <div class="tech-options">
                            ${grouped.frontend.map(tech => `
                                <button type="button" class="tech-option-btn ${selectedTech.includes(tech.name) ? 'selected' : ''}" 
                                        onclick="window.adminDashboard.toggleTech('${tech.name}')" data-tech="${tech.name}">
                                    <i class="${tech.icon_class}"></i> ${tech.name}
                                </button>
                            `).join('')}
                            <button type="button" class="tech-add-btn" onclick="window.adminDashboard.showAddTechModal('frontend')">
                                <i class="fas fa-plus"></i> Add Frontend
                            </button>
                        </div>
                    </div>

                    <!-- Backend -->
                    <div class="tech-category">
                        <h4 style="font-size: 0.9rem; color: var(--color-neon-blue); margin-bottom: 10px;">
                            <i class="fas fa-server"></i> Backend Frameworks
                        </h4>
                        <div class="tech-options">
                            ${grouped.backend.map(tech => `
                                <button type="button" class="tech-option-btn ${selectedTech.includes(tech.name) ? 'selected' : ''}" 
                                        onclick="window.adminDashboard.toggleTech('${tech.name}')" data-tech="${tech.name}">
                                    <i class="${tech.icon_class}"></i> ${tech.name}
                                </button>
                            `).join('')}
                            <button type="button" class="tech-add-btn" onclick="window.adminDashboard.showAddTechModal('backend')">
                                <i class="fas fa-plus"></i> Add Backend
                            </button>
                        </div>
                    </div>

                    <input type="hidden" name="tech" id="techInput" value="${selectedTech.join(',')}">
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label>GitHub Link (optional)</label>
                        <input type="text" name="github" value="${project.github_url || ''}" placeholder="https://github.com/username/repo">
                    </div>
                    <div class="form-group">
                        <label>Demo Link (optional)</label>
                        <input type="text" name="demo" value="${project.demo_url || ''}" placeholder="https://demo.example.com">
                    </div>
                </div>
                <button type="submit" class="btn btn-primary">
                    <i class="fas fa-save"></i> Save Project
                </button>
            </form>
        `;

        // Store selected technologies in instance variable
        this.selectedTechnologies = selectedTech;

        document.getElementById('itemForm').addEventListener('submit', (e) => this.saveProject(e));
        modal.classList.add('show');
    }

    toggleTech(techName) {
        if (!this.selectedTechnologies) this.selectedTechnologies = [];

        const index = this.selectedTechnologies.indexOf(techName);
        if (index > -1) {
            this.selectedTechnologies.splice(index, 1);
        } else {
            this.selectedTechnologies.push(techName);
        }

        // Update hidden input
        document.getElementById('techInput').value = this.selectedTechnologies.join(',');

        // Update button state
        const btn = document.querySelector(`[data-tech="${techName}"]`);
        if (btn) {
            btn.classList.toggle('selected');
        }

        // Update tags display
        this.updateTechTags();
    }

    removeTech(techName) {
        this.toggleTech(techName);
    }

    updateTechTags() {
        const container = document.getElementById('selectedTechTags');
        if (!container) return;

        container.innerHTML = this.selectedTechnologies.map(tech => `
            <span class="tech-tag" data-tech="${tech}">
                ${tech} <i class="fas fa-times" onclick="window.adminDashboard.removeTech('${tech}')"></i>
            </span>
        `).join('') || '<span style="color: var(--color-text-tertiary);">No technologies selected</span>';
    }

    showAddTechModal(category) {
        // Save current form data to prevent loss
        this.saveCurrentFormState();

        // Create add tech modal
        const addTechModal = document.createElement('div');
        addTechModal.id = 'addTechModal';
        addTechModal.className = 'modal show';
        addTechModal.style.zIndex = '10001';

        const categoryNames = {
            database: 'Database',
            language: 'Language',
            frontend: 'Frontend Framework',
            backend: 'Backend Framework'
        };

        addTechModal.innerHTML = `
            <div class="modal-content card-3d" style="max-width: 500px;">
                <div class="modal-header">
                    <h2>Add Custom ${categoryNames[category]}</h2>
                    <button class="modal-close" onclick="document.getElementById('addTechModal').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <form id="addTechForm" class="admin-form">
                        <div class="form-group">
                            <label>Technology Name</label>
                            <input type="text" name="name" required placeholder="e.g., Redis, Vue.js">
                        </div>
                        <div class="form-group">
                            <label>Devicon Class (optional)</label>
                            <input type="text" name="icon_class" placeholder="e.g., devicon-redis-plain colored">
                            <small style="color: var(--color-text-tertiary);">
                                Find icons at: <a href="https://devicon.dev" target="_blank">devicon.dev</a>
                            </small>
                        </div>
                        <div class="form-group">
                            <label>Custom Icon URL (optional)</label>
                            <input type="text" name="icon_url" placeholder="https://example.com/logo.png">
                        </div>
                        <button type="submit" class="btn btn-primary">
                            <i class="fas fa-plus"></i> Add Technology
                        </button>
                    </form>
                </div>
            </div>
        `;

        document.body.appendChild(addTechModal);

        document.getElementById('addTechForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);

            try {
                const response = await fetch(`${API_URL}/technologies`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({
                        name: formData.get('name'),
                        category: category,
                        icon_class: formData.get('icon_class') || null,
                        icon_url: formData.get('icon_url') || null
                    })
                });

                const data = await response.json();

                if (data.success) {
                    this.showNotification('Technology added successfully!');
                    addTechModal.remove();
                    // Reload ONLY the technology buttons, not the entire modal
                    await this.refreshTechnologyButtons();
                } else {
                    alert('Failed to add technology');
                }
            } catch (err) {
                console.error('Add tech error:', err);
                alert('Error adding technology');
            }
        });
    }

    saveCurrentFormState() {
        // Save all form field values
        const form = document.getElementById('itemForm');
        if (!form) return;

        this.savedFormState = {
            title: form.querySelector('[name="title"]')?.value || '',
            description: form.querySelector('[name="description"]')?.value || '',
            status: form.querySelector('[name="status"]')?.value || 'completed',
            github: form.querySelector('[name="github"]')?.value || '',
            demo: form.querySelector('[name="demo"]')?.value || '',
            selectedTech: [...this.selectedTechnologies]
        };
    }

    async refreshTechnologyButtons() {
        // Load updated technologies from database
        const technologies = await fetch(`${API_URL}/technologies`, { credentials: 'include' })
            .then(res => res.json())
            .catch(() => []);

        // Group by category
        const grouped = {
            database: technologies.filter(t => t.category === 'database'),
            language: technologies.filter(t => t.category === 'language'),
            frontend: technologies.filter(t => t.category === 'frontend'),
            backend: technologies.filter(t => t.category === 'backend')
        };

        // Update each category section
        this.updateCategoryButtons('database', grouped.database);
        this.updateCategoryButtons('language', grouped.language);
        this.updateCategoryButtons('frontend', grouped.frontend);
        this.updateCategoryButtons('backend', grouped.backend);
    }

    updateCategoryButtons(category, technologies) {
        // Find the category container
        const containers = document.querySelectorAll('.tech-category');
        let targetContainer = null;

        containers.forEach(container => {
            const heading = container.querySelector('h4');
            if (heading && heading.textContent.toLowerCase().includes(category)) {
                targetContainer = container;
            }
        });

        if (!targetContainer) return;

        const optionsDiv = targetContainer.querySelector('.tech-options');
        if (!optionsDiv) return;

        // Rebuild buttons for this category
        const categoryLabels = {
            database: 'Database',
            language: 'Language',
            frontend: 'Frontend',
            backend: 'Backend'
        };

        optionsDiv.innerHTML = technologies.map(tech => `
            <button type="button" class="tech-option-btn ${this.selectedTechnologies.includes(tech.name) ? 'selected' : ''}" 
                    onclick="window.adminDashboard.toggleTech('${tech.name}')" data-tech="${tech.name}">
                <i class="${tech.icon_class}"></i> ${tech.name}
            </button>
        `).join('') + `
            <button type="button" class="tech-add-btn" onclick="window.adminDashboard.showAddTechModal('${category}')">
                <i class="fas fa-plus"></i> Add ${categoryLabels[category]}
            </button>
        `;
    }

    async saveProject(e) {
        e.preventDefault();
        const form = e.target;
        const formData = new FormData();

        // Add all form fields
        formData.append('title', form.querySelector('[name="title"]').value);
        formData.append('description', form.querySelector('[name="description"]').value);
        formData.append('status', form.querySelector('[name="status"]').value);
        formData.append('github_url', form.querySelector('[name="github"]').value || '');
        formData.append('demo_url', form.querySelector('[name="demo"]').value || '');

        // Get technologies from hidden input
        const techInput = document.getElementById('techInput');
        const technologies = techInput ? techInput.value : '';
        formData.append('technologies', technologies);

        // Add image if selected
        const imageInput = document.getElementById('imageInput');
        if (imageInput && imageInput.files[0]) {
            formData.append('image', imageInput.files[0]);
        }

        try {
            const url = this.editingId
                ? `${API_URL}/projects/${this.editingId}`
                : `${API_URL}/projects`;

            const method = this.editingId ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                credentials: 'include',
                body: formData // Send as FormData for file upload
            });

            const data = await response.json();

            if (data.success) {
                this.showNotification(this.editingId ? 'Project updated successfully!' : 'Project added successfully!');
                this.closeModal();
                await this.loadProjects();
                await this.loadDashboard();
            } else {
                alert('Failed to save project: ' + (data.message || 'Unknown error'));
            }
        } catch (err) {
            console.error('Save project error:', err);
            alert('Error saving project');
        }
    }

    async showCertificateModal(id = null) {
        const modal = document.getElementById('modal');
        const modalTitle = document.getElementById('modalTitle');
        const modalBody = document.getElementById('modalBody');

        this.editingId = id;
        modalTitle.textContent = id ? 'Edit Certificate' : 'Add Certificate';

        let cert = {};
        if (id) {
            const certificates = await this.store.getData('certificates');
            cert = certificates.find(c => c.id == id) || {};
        }

        // Format dates for HTML date input (YYYY-MM-DD)
        const formatDate = (dateStr) => {
            if (!dateStr) return '';
            const date = new Date(dateStr);
            return date.toISOString().split('T')[0];
        };

        const fromDate = formatDate(cert.from_date || cert.fromDate);
        const toDate = formatDate(cert.to_date || cert.toDate);

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
                <div class="form-row">
                    <div class="form-group">
                        <label>From Date</label>
                        <input type="date" name="fromDate" value="${fromDate}">
                    </div>
                    <div class="form-group">
                        <label>To Date</label>
                        <input type="date" name="toDate" value="${toDate}">
                    </div>
                </div>
                <div class="form-group">
                    <label>Certificate PDF ${id ? '(optional - leave empty to keep current)' : ''}</label>
                    <input type="file" name="pdf" accept=".pdf,application/pdf" id="pdfInput">
                    <small style="color: var(--color-text-tertiary);">${id && cert.pdf_path ? `Current: ${cert.pdf_path.split('/').pop()}` : 'Upload certificate PDF file'}</small>
                </div>
                <div class="form-group">
                    <label>Verification Link (optional)</label>
                    <input type="url" name="link" value="${cert.verification_url || cert.link || ''}" placeholder="https://verify.example.com/...">
                </div>
                <button type="submit" class="btn btn-primary">
                    <i class="fas fa-save"></i> Save Certificate
                </button>
            </form>
        `;

        document.getElementById('itemForm').addEventListener('submit', (e) => this.saveCertificate(e));
        modal.classList.add('show');
    }

    async saveCertificate(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const pdfInput = document.getElementById('pdfInput');

        // Create FormData for API
        const apiFormData = new FormData();
        apiFormData.append('title', formData.get('title'));
        apiFormData.append('issuer', formData.get('issuer'));
        apiFormData.append('from_date', formData.get('fromDate'));
        apiFormData.append('to_date', formData.get('toDate'));
        apiFormData.append('verification_url', formData.get('link') || '');

        if (pdfInput.files[0]) {
            apiFormData.append('pdf', pdfInput.files[0]);
        }

        try {
            const url = this.editingId
                ? `${API_URL}/certificates/${this.editingId}`
                : `${API_URL}/certificates`;

            const method = this.editingId ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                credentials: 'include',
                body: apiFormData
            });

            const data = await response.json();

            if (data.success) {
                this.closeModal();
                this.loadCertificates();
                this.loadDashboard();
                this.showNotification('Certificate saved successfully!');
            } else {
                alert('Failed to save certificate');
            }
        } catch (err) {
            console.error('Save certificate error:', err);
            alert('Error saving certificate');
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

    // Add/Edit Individual Skill
    async showAddSkillModal(skillId = null) {
        const modal = document.getElementById('modal');
        const modalTitle = document.getElementById('modalTitle');
        const modalBody = document.getElementById('modalBody');

        this.editingId = skillId;
        modalTitle.textContent = skillId ? 'Edit Skill' : 'Add Skill';

        // Fetch existing skills to get categories
        const response = await fetch(`${API_URL}/skills`);
        const allSkills = await response.json();

        // Get unique categories
        const categories = [...new Set(allSkills.map(s => s.category))].sort();

        // If editing, fetch the skill data
        let skill = {};
        if (skillId) {
            const skillResponse = await fetch(`${API_URL}/skills/${skillId}`);
            skill = await skillResponse.json();
        }

        // Fetch technologies for icon selection
        const techResponse = await fetch(`${API_URL}/technologies`);
        const technologies = await techResponse.json();

        modalBody.innerHTML = `
            <form id="itemForm" class="admin-form">
                <div class="form-group">
                    <label>Skill Name *</label>
                    <input type="text" name="name" value="${skill.name || ''}" placeholder="e.g., Java" required>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label>Level</label>
                        <select name="level">
                            <option value="">Select Level</option>
                            <option value="Beginner" ${skill.level === 'Beginner' ? 'selected' : ''}>Beginner</option>
                            <option value="Intermediate" ${skill.level === 'Intermediate' ? 'selected' : ''}>Intermediate</option>
                            <option value="Advanced" ${skill.level === 'Advanced' ? 'selected' : ''}>Advanced</option>
                            <option value="Expert" ${skill.level === 'Expert' ? 'selected' : ''}>Expert</option>
                        </select>
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label>Category *</label>
                        <select name="category" id="skillCategorySelect" required>
                            <option value="">Select Category</option>
                            ${categories.map(cat => `
                                <option value="${cat}" ${skill.category === cat ? 'selected' : ''}>${cat}</option>
                            `).join('')}
                            <option value="__new__">+ Create New Category</option>
                        </select>
                    </div>

                    <div class="form-group" id="newCategoryGroup" style="display: none;">
                        <label>New Category Name</label>
                        <input type="text" name="newCategory" id="newCategoryInput" placeholder="e.g., Frontend">
                    </div>
                </div>

                <div class="form-group">
                    <label>Icon (Devicon class or emoji)</label>
                    <input type="text" name="icon" value="${skill.icon || skill.icon_class || ''}" 
                           placeholder="devicon-java-plain or ☕">
                    <small style="color: var(--color-text-tertiary);">
                        Find icons at <a href="https://devicon.dev" target="_blank">devicon.dev</a>
                    </small>
                </div>

                <div class="form-group">
                    <label>Technology (for icon mapping)</label>
                    <select name="technology_id">
                        <option value="">None</option>
                        ${technologies.map(tech => `
                            <option value="${tech.id}" ${skill.technology_id == tech.id ? 'selected' : ''}>
                                ${tech.name}
                            </option>
                        `).join('')}
                    </select>
                    <small style="color: var(--color-text-tertiary);">
                        Select if this skill matches a technology for automatic icon
                    </small>
                </div>

                <button type="submit" class="btn btn-primary">
                    <i class="fas fa-save"></i> ${skillId ? 'Update' : 'Add'} Skill
                </button>
            </form>
        `;

        // Handle category selection
        const categorySelect = document.getElementById('skillCategorySelect');
        const newCategoryGroup = document.getElementById('newCategoryGroup');
        const newCategoryInput = document.getElementById('newCategoryInput');

        categorySelect.addEventListener('change', () => {
            if (categorySelect.value === '__new__') {
                newCategoryGroup.style.display = 'block';
                newCategoryInput.required = true;
            } else {
                newCategoryGroup.style.display = 'none';
                newCategoryInput.required = false;
            }
        });

        document.getElementById('itemForm').addEventListener('submit', (e) => this.saveIndividualSkill(e));
        modal.classList.add('show');
    }

    async saveIndividualSkill(e) {
        e.preventDefault();
        const formData = new FormData(e.target);

        // Determine category
        let category = formData.get('category');
        if (category === '__new__') {
            category = formData.get('newCategory');
            if (!category || !category.trim()) {
                alert('Please enter a new category name');
                return;
            }
        }

        const data = {
            name: formData.get('name'),
            category: category,
            level: formData.get('level') || null,
            icon: formData.get('icon') || null,
            icon_class: formData.get('icon') || null,
            technology_id: formData.get('technology_id') || null
        };

        try {
            const url = this.editingId
                ? `${API_URL}/skills/${this.editingId}`
                : `${API_URL}/skills`;

            const method = this.editingId ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(data)
            });

            if (!response.ok) throw new Error('Failed to save skill');

            this.closeModal();
            this.loadSkills();
            this.showNotification(`Skill ${this.editingId ? 'updated' : 'added'} successfully!`);
        } catch (err) {
            console.error('Save skill error:', err);
            alert('Failed to save skill. Please try again.');
        }
    }

    async editSkill(id) {
        this.showAddSkillModal(id);
    }

    async deleteSkill(id) {
        const confirmed = await this.showConfirm(
            'This skill will be permanently deleted. This action cannot be undone.',
            'Delete Skill?',
            'danger'
        );
        if (!confirmed) return;

        try {
            const response = await fetch(`${API_URL}/skills/${id}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            if (!response.ok) throw new Error('Failed to delete skill');

            this.loadSkills();
            this.showNotification('Skill deleted successfully!');
        } catch (err) {
            console.error('Delete skill error:', err);
            alert('Failed to delete skill. Please try again.');
        }
    }

    async deleteCategory(category) {
        const confirmed = await this.showConfirm(
            `All skills in the "${category}" category will be permanently deleted. This action cannot be undone.`,
            'Delete Entire Category?',
            'danger'
        );
        if (!confirmed) return;

        try {
            // Fetch all skills in this category
            const response = await fetch(`${API_URL}/skills`);
            const allSkills = await response.json();
            const skillsInCategory = allSkills.filter(s => s.category === category);

            // Delete each skill in the category
            for (const skill of skillsInCategory) {
                await fetch(`${API_URL}/skills/${skill.id}`, {
                    method: 'DELETE',
                    credentials: 'include'
                });
            }

            this.loadSkills();
            this.showNotification(`Category "${category}" and all its skills deleted successfully!`);
        } catch (err) {
            console.error('Delete category error:', err);
            alert('Failed to delete category. Please try again.');
        }
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

    async deleteCertificate(id) {
        const confirmed = await this.showConfirm(
            'This certificate will be permanently deleted. This action cannot be undone.',
            'Delete Certificate?',
            'danger'
        );
        if (!confirmed) return;

        try {
            const result = await this.store.deleteItem('certificates', id);
            if (result.success) {
                this.showNotification('Certificate deleted!');
                this.loadCertificates();
                this.loadDashboard();
            }
        } catch (err) {
            console.error('Delete certificate error:', err);
        }
    }

    async deleteMessage(id) {
        const confirmed = await this.showConfirm(
            'This message will be permanently deleted. This action cannot be undone.',
            'Delete Message?',
            'danger'
        );
        if (!confirmed) return;

        try {
            const result = await this.store.deleteItem('messages', id);
            if (result.success) {
                this.showNotification('Message deleted!');
                this.loadMessages();
                this.loadDashboard();
            }
        } catch (err) {
            console.error('Delete message error:', err);
        }
    }
}

// Initialize admin dashboard and make it globally accessible
window.adminDashboard = null;
document.addEventListener('DOMContentLoaded', () => {
    window.adminDashboard = new AdminDashboard();
});
