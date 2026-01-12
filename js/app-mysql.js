// ============================================
// PORTFOLIO - MySQL API Version
// Main Portfolio Frontend
// ============================================

const API_URL = 'http://localhost:3000/api';

// ============================================
// DATA MANAGER - API Version
// ============================================
class DataManager {
    async fetchData(endpoint) {
        try {
            const response = await fetch(`${API_URL}${endpoint}`);
            if (!response.ok) throw new Error('Network response was not ok');
            return await response.json();
        } catch (err) {
            console.error(`Error fetching ${endpoint}:`, err);
            return this.getDefaultData(endpoint);
        }
    }

    async saveData(endpoint, data) {
        try {
            const response = await fetch(`${API_URL}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            return await response.json();
        } catch (err) {
            console.error(`Error saving to ${endpoint}:`, err);
            return { success: false };
        }
    }

    getDefaultData(endpoint) {
        const defaults = {
            '/profile': {
                name: 'Your Name',
                title: 'Backend Engineer',
                punchline: 'Building amazing things',
                about: 'About me...',
                email: 'email@example.com',
                phone: '+1234567890',
                location: 'City, Country'
            },
            '/skills': [],
            '/projects': [],
            '/certificates': [],
            '/messages': []
        };
        return defaults[endpoint] || {};
    }
}

// ============================================
// CONTENT RENDERER
// ============================================
class ContentRenderer {
    constructor() {
        this.dataManager = new DataManager();
    }

    async init() {
        await this.loadProfile();
        await this.loadSkills();
        await this.loadProjects();
        await this.loadCertificates();
    }

    async loadProfile() {
        try {
            const profile = await this.dataManager.fetchData('/profile');

            // Update hero section
            document.getElementById('heroName').textContent = profile.name;
            document.getElementById('heroPunchline').textContent = profile.punchline;

            // Update about section - including profile image
            const aboutImage = document.getElementById('aboutImage');
            if (aboutImage && profile.image_path) {
                aboutImage.src = profile.image_path;
            }

            document.getElementById('aboutContent').innerHTML = (profile.about || '').split('\n\n')
                .map(p => `<p${p.includes('passionate') ? ' class="lead-text"' : ''}>${p}</p>`)
                .join('');

            // Update counts
            const projectsCount = document.getElementById('projectsCount');
            if (projectsCount) {
                const projects = await this.dataManager.fetchData('/projects');
                projectsCount.textContent = projects.length + '+';
            }

            // Update contact section
            document.getElementById('contactEmail').textContent = profile.email;
            document.getElementById('contactEmail').href = `mailto:${profile.email}`;
            document.getElementById('contactPhone').textContent = profile.phone;
            document.getElementById('contactPhone').href = `tel:${profile.phone.replace(/\s/g, '')}`;
            document.getElementById('contactLocation').textContent = profile.location;

            // Initialize typing effect
            const typingTexts = [
                profile.title || 'Backend Engineer',
                'Java Developer',
                'Spring Boot Expert',
                'API Architect'
            ];
            new TypingEffect(document.getElementById('typingText'), typingTexts);

            // Resume download
            if (profile.resume_path) {
                const downloadBtn = document.getElementById('downloadResumeBtn');
                const aboutDownloadBtn = document.getElementById('downloadResume');

                if (downloadBtn) {
                    downloadBtn.href = profile.resume_path;
                    downloadBtn.style.display = 'inline-flex';
                }
                if (aboutDownloadBtn) {
                    aboutDownloadBtn.href = profile.resume_path;
                    aboutDownloadBtn.style.display = 'inline-flex';
                }
            }
        } catch (err) {
            console.error('Load profile error:', err);
        }
    }

    async loadSkills() {
        try {
            const skills = await this.dataManager.fetchData('/skills');
            const container = document.getElementById('skillsContainer');

            if (!container) return;

            // Group skills by category
            const grouped = {};
            skills.forEach(skill => {
                if (!grouped[skill.category]) {
                    grouped[skill.category] = [];
                }
                grouped[skill.category].push(skill);
            });

            container.innerHTML = Object.keys(grouped).map(category => `
                <div class="skill-category" data-aos="fade-up">
                    <h3 class="skill-category-title">${category}</h3>
                    <div class="skills-grid">
                        ${grouped[category].map(skill => `
                            <div class="skill-item">
                                <div class="skill-icon">${skill.icon || '💡'}</div>
                                <span class="skill-name">${skill.name}</span>
                                ${skill.level ? `<span class="skill-level">${skill.level}</span>` : ''}
                            </div>
                        `).join('')}
                    </div>
                </div>
            `).join('');
        } catch (err) {
            console.error('Load skills error:', err);
        }
    }

    async loadProjects() {
        try {
            const projects = await this.dataManager.fetchData('/projects');
            const grid = document.getElementById('projectsGrid');

            if (!grid) return;

            if (projects.length === 0) {
                grid.innerHTML = '<p class="text-center">No projects yet.</p>';
                return;
            }

            grid.innerHTML = projects.map(project => `
                <div class="project-card" data-aos="fade-up" data-status="${project.status}">
                    <div class="project-image">
                        <img src="${project.image_path || 'assets/placeholder.jpg'}" alt="${project.title}" onerror="this.src='assets/placeholder.jpg'">
                        <div class="project-status status-${project.status}">
                            ${project.status === 'completed' ? 'Completed' : 'In Development'}
                        </div>
                    </div>
                    <div class="project-content">
                        <h3 class="project-title">${project.title}</h3>
                        <p class="project-description">${project.description}</p>
                        <div class="project-tech">
                            ${(project.tech || []).map(tech => `<span class="tech-tag">${tech}</span>`).join('')}
                        </div>
                        <div class="project-links">
                            ${project.github_url && project.github_url !== '' ? `
                                <a href="${project.github_url}" class="project-link" target="_blank" rel="noopener">
                                    <i class="fab fa-github"></i> Code
                                </a>
                            ` : ''}
                            ${project.demo_url && project.demo_url !== '' ? `
                                <a href="${project.demo_url}" class="project-link" target="_blank" rel="noopener">
                                    <i class="fas fa-external-link-alt"></i> Demo
                                </a>
                            ` : ''}
                        </div>
                    </div>
                </div>
            `).join('');

            this.initProjectFilter();
        } catch (err) {
            console.error('Load projects error:', err);
        }
    }

    initProjectFilter() {
        const filterBtns = document.querySelectorAll('.filter-btn');
        const projects = document.querySelectorAll('.project-card');

        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const filter = btn.getAttribute('data-filter');

                projects.forEach(project => {
                    if (filter === 'all' || project.getAttribute('data-status') === filter) {
                        project.style.display = 'block';
                        setTimeout(() => {
                            project.style.opacity = '1';
                            project.style.transform = 'translateY(0)';
                        }, 100);
                    } else {
                        project.style.opacity = '0';
                        project.style.transform = 'translateY(20px)';
                        setTimeout(() => {
                            project.style.display = 'none';
                        }, 300);
                    }
                });
            });
        });
    }

    async loadCertificates() {
        try {
            const certificates = await this.dataManager.fetchData('/certificates');
            const grid = document.getElementById('certificatesGrid');

            if (!grid) return;

            if (certificates.length === 0) {
                grid.innerHTML = '<p class="text-center">No certificates yet.</p>';
                return;
            }

            grid.innerHTML = certificates.map((cert, index) => `
                <div class="certificate-card" data-aos="fade-up" data-aos-delay="${index * 100}">
                    <div class="certificate-content">
                        <div class="cert-icon">
                            <i class="fas fa-certificate"></i>
                        </div>
                        <h3 class="certificate-title">${cert.title}</h3>
                        <div class="certificate-issuer">${cert.issuer}</div>
                        <div class="certificate-date">
                            <i class="far fa-calendar-alt"></i>
                            ${new Date(cert.from_date).toLocaleDateString()} - 
                            ${new Date(cert.to_date).toLocaleDateString()}
                        </div>
                        <div class="certificate-duration">
                            <i class="far fa-clock"></i> ${cert.duration || 'N/A'}
                        </div>
                        <div class="certificate-actions">
                            ${cert.pdf_path ? `
                                <a href="${cert.pdf_path}" class="btn-text" download="${cert.title}.pdf">
                                    <i class="fas fa-file-pdf"></i> Download PDF
                                </a>
                            ` : ''}
                            ${cert.verification_url && cert.verification_url !== '' ? `
                                <a href="${cert.verification_url}" class="btn-text" target="_blank">
                                    <i class="fas fa-external-link-alt"></i> Verify
                                </a>
                            ` : ''}
                        </div>
                    </div>
                </div>
            `).join('');
        } catch (err) {
            console.error('Load certificates error:', err);
        }
    }
}

// ============================================
// CONTACT FORM
// ============================================
class ContactForm {
    constructor() {
        this.form = document.getElementById('contactForm');
        this.init();
    }

    init() {
        if (!this.form) return;
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    }

    async handleSubmit(e) {
        e.preventDefault();

        const formData = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            subject: document.getElementById('subject').value,
            message: document.getElementById('message').value
        };

        try {
            const response = await fetch(`${API_URL}/contact`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (data.success) {
                this.showMessage('Message sent successfully! I\'ll get back to you soon.', 'success');
                this.form.reset();
            } else {
                this.showMessage('Failed to send message. Please try again or email me directly.', 'error');
            }
        } catch (error) {
            console.error('Contact form error:', error);
            this.showMessage('Failed to send message. Please try again or email me directly.', 'error');
        }
    }

    showMessage(message, type) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `form-message ${type}`;
        messageDiv.textContent = message;
        messageDiv.style.cssText = `
            padding: 1rem;
            margin-top: 1rem;
            border-radius: 0.5rem;
            background: ${type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)'};
            color: ${type === 'success' ? '#10b981' : '#ef4444'};
            border: 1px solid ${type === 'success' ? '#10b981' : '#ef4444'};
        `;

        this.form.appendChild(messageDiv);
        setTimeout(() => messageDiv.remove(), 5000);
    }
}

// Note: Keep existing Navigation, TypingEffect, and CardTilt classes from original app.js
// They don't need to change as they don't interact with data

// ============================================
// INITIALIZE APP
// ============================================
document.addEventListener('DOMContentLoaded', async () => {
    // Initialize content renderer
    const renderer = new ContentRenderer();
    await renderer.init();

    // Initialize contact form
    new ContactForm();

    // Note: Navigation, TypingEffect, CardTilt classes should be kept from original app.js
    // Add them here or keep them in the original file
});
