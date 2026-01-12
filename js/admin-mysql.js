// ============================================
// ADMIN PANEL - MySQL API Version
// ============================================

const API_URL = 'http://localhost:3000/api';

// ============================================
// AUTHENTICATION
// ============================================
class Auth {
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

// ============================================
// ADMIN DASHBOARD
// ============================================
class AdminDashboard {
    constructor() {
        this.auth = new Auth();
        this.currentSection = 'dashboard';
        this.editingId = null;
    }

    async init() {
        const isAuth = await this.auth.checkAuth();
        if (isAuth) {
            this.loadDashboard();
            this.setupEventListeners();
        }
    }

    setupEventListeners() {
        // Login form
        document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            await this.auth.login(username, password);
            if (await this.auth.checkAuth()) {
                this.loadDashboard();
            }
        });

        // Logout
        document.getElementById('logoutBtn')?.addEventListener('click', () => {
            this.auth.logout();
        });

        // Navigation
        document.querySelectorAll('[data-section]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.loadSection(link.getAttribute('data-section'));
            });
        });

        // Add buttons
        document.getElementById('addProjectBtn')?.addEventListener('click', () => this.showProjectModal());
        document.getElementById('addSkillBtn')?.addEventListener('click', () => this.showSkillModal());
        document.getElementById('addCertificateBtn')?.addEventListener('click', () => this.showCertificateModal());
    }

    async loadDashboard() {
        try {
            const response = await fetch(`${API_URL}/dashboard`, { credentials: 'include' });
            const stats = await response.json();

            document.getElementById('totalProjects').textContent = stats.total_projects || 0;
            document.getElementById('totalCertificates').textContent = stats.total_certificates || 0;
            document.getElementById('totalMessages').textContent = stats.total_messages || 0;
            document.getElementById('totalSkills').textContent = stats.total_skills || 0;
        } catch (err) {
            console.error('Dashboard load error:', err);
        }
    }

    loadSection(section) {
        this.currentSection = section;

        // Update active nav
        document.querySelectorAll('[data-section]').forEach(link => {
            link.classList.remove('active');
        });
        document.querySelector(`[data-section="${section}"]`)?.classList.add('active');

        // Hide all sections
        document.querySelectorAll('.admin-section').forEach(sec => {
            sec.style.display = 'none';
        });

        // Show selected section
        document.getElementById(`${section}Section`)?.style.display = 'block';

        // Load data
        switch (section) {
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
        }
    }

    // ============================================
    // PROFILE
    // ============================================
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
            } else {
                alert('Failed to update profile');
            }
        } catch (err) {
            console.error('Save profile error:', err);
            alert('Error saving profile');
        }
    }

    // ============================================
    // SKILLS
    // ============================================
    async loadSkills() {
        try {
            const response = await fetch(`${API_URL}/skills`, { credentials: 'include' });
            const skills = await response.json();

            const container = document.getElementById('skillsList');
            if (!container) return;

            if (skills.length === 0) {
                container.innerHTML = '<p style="text-align: center;">No skills added yet.</p>';
                return;
            }

            container.innerHTML = skills.map(skill => `
                <div class="item-card">
                    <div class="item-info">
                        <h3>${skill.name}</h3>
                        <p>${skill.category} • ${skill.level || 'Intermediate'}</p>
                    </div>
                    <div class="item-actions">
                        <button class="btn-icon" onclick="adminDashboard.editSkill(${skill.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon delete" onclick="adminDashboard.deleteSkill(${skill.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `).join('');
        } catch (err) {
            console.error('Load skills error:', err);
        }
    }

    showSkillModal(id = null) {
        // Implementation similar to old version but will be added
        alert('Skill modal - to be implemented in next update');
    }

    async deleteSkill(id) {
        if (!confirm('Delete this skill?')) return;

        try {
            const response = await fetch(`${API_URL}/skills/${id}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            const data = await response.json();
            if (data.success) {
                this.showNotification('Skill deleted!');
                this.loadSkills();
                this.loadDashboard();
            }
        } catch (err) {
            console.error('Delete skill error:', err);
        }
    }

    // ============================================
    // PROJECTS
    // ============================================
    async loadProjects() {
        try {
            const response = await fetch(`${API_URL}/projects`, { credentials: 'include' });
            const projects = await response.json();

            const container = document.getElementById('projectsList');
            if (!container) return;

            if (projects.length === 0) {
                container.innerHTML = '<p style="text-align: center;">No projects added yet.</p>';
                return;
            }

            container.innerHTML = projects.map(project => `
                <div class="item-card">
                    <div class="item-info">
                        <h3>${project.title}</h3>
                        <p>${project.status === 'completed' ? 'Completed' : 'In Development'} • ${project.tech?.join(', ') || 'No tech'}</p>
                    </div>
                    <div class="item-actions">
                        <button class="btn-icon" onclick="adminDashboard.editProject(${project.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon delete" onclick="adminDashboard.deleteProject(${project.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `).join('');
        } catch (err) {
            console.error('Load projects error:', err);
        }
    }

    async deleteProject(id) {
        if (!confirm('Delete this project?')) return;

        try {
            const response = await fetch(`${API_URL}/projects/${id}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            const data = await response.json();
            if (data.success) {
                this.showNotification('Project deleted!');
                this.loadProjects();
                this.loadDashboard();
            }
        } catch (err) {
            console.error('Delete project error:', err);
        }
    }

    // ============================================
    // CERTIFICATES
    // ============================================
    async loadCertificates() {
        try {
            const response = await fetch(`${API_URL}/certificates`, { credentials: 'include' });
            const certificates = await response.json();

            const container = document.getElementById('certificatesList');
            if (!container) return;

            if (certificates.length === 0) {
                container.innerHTML = '<p style="text-align: center;">No certificates added yet.</p>';
                return;
            }

            container.innerHTML = certificates.map(cert => `
                <div class="item-card">
                    <div class="item-info">
                        <h3>${cert.title}</h3>
                        <p>${cert.issuer} • ${cert.duration || 'N/A'}</p>
                        <small>${new Date(cert.from_date).toLocaleDateString()} - ${new Date(cert.to_date).toLocaleDateString()}</small>
                    </div>
                    <div class="item-actions">
                        <button class="btn-icon" onclick="adminDashboard.editCertificate(${cert.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon delete" onclick="adminDashboard.deleteCertificate(${cert.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `).join('');
        } catch (err) {
            console.error('Load certificates error:', err);
        }
    }

    async deleteCertificate(id) {
        if (!confirm('Delete this certificate?')) return;

        try {
            const response = await fetch(`${API_URL}/certificates/${id}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            const data = await response.json();
            if (data.success) {
                this.showNotification('Certificate deleted!');
                this.loadCertificates();
                this.loadDashboard();
            }
        } catch (err) {
            console.error('Delete certificate error:', err);
        }
    }

    // ============================================
    // MESSAGES
    // ============================================
    async loadMessages() {
        try {
            const response = await fetch(`${API_URL}/messages`, { credentials: 'include' });
            const messages = await response.json();

            const container = document.getElementById('messagesList');
            if (!container) return;

            if (messages.length === 0) {
                container.innerHTML = '<p style="text-align: center;">No messages yet.</p>';
                return;
            }

            container.innerHTML = messages.map(msg => `
                <div class="message-card">
                    <div class="message-header">
                        <div class="message-sender">
                            <h3>${msg.name}</h3>
                            <p>${msg.email}</p>
                        </div>
                        <div class="message-date">${new Date(msg.created_at).toLocaleDateString()}</div>
                    </div>
                    <div class="message-subject">${msg.subject || 'No subject'}</div>
                    <div class="message-body">${msg.message}</div>
                    <button class="btn btn-danger" onclick="adminDashboard.deleteMessage(${msg.id})">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            `).join('');
        } catch (err) {
            console.error('Load messages error:', err);
        }
    }

    async deleteMessage(id) {
        if (!confirm('Delete this message?')) return;

        try {
            const response = await fetch(`${API_URL}/messages/${id}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            const data = await response.json();
            if (data.success) {
                this.showNotification('Message deleted!');
                this.loadMessages();
                this.loadDashboard();
            }
        } catch (err) {
            console.error('Delete message error:', err);
        }
    }

    // ============================================
    // HELPERS
    // ============================================
    showNotification(message) {
        // Simple notification
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        notification.style.cssText = 'position: fixed; top: 20px; right: 20px; background: #10b981; color: white; padding: 1rem 2rem; border-radius: 8px; z-index: 9999;';
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
    }
}

// ============================================
// INITIALIZE
// ============================================
let adminDashboard;

document.addEventListener('DOMContentLoaded', () => {
    adminDashboard = new AdminDashboard();
    adminDashboard.init();

    // Setup profile form
    document.getElementById('profileForm')?.addEventListener('submit', (e) => {
        adminDashboard.saveProfile(e);
    });
});
