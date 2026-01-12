// ===================================
// PORTFOLIO APP - Main JavaScript
// ===================================

// API Configuration
const API_URL = 'http://localhost:3000/api';

// ===================================
// NAVIGATION
// ===================================

class Navigation {
    constructor() {
        this.navbar = document.getElementById('navbar');
        this.navLinks = document.querySelectorAll('.nav-link');
        this.hamburger = document.getElementById('hamburger');
        this.navMenu = document.getElementById('navMenu');

        this.init();
    }

    init() {
        // Scroll effect
        window.addEventListener('scroll', () => this.handleScroll());

        // Active link on scroll
        window.addEventListener('scroll', () => this.updateActiveLink());

        // Smooth scroll
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => this.smoothScroll(e));
        });

        // Mobile menu
        if (this.hamburger) {
            this.hamburger.addEventListener('click', () => this.toggleMobileMenu());
        }
    }

    handleScroll() {
        if (window.scrollY > 50) {
            this.navbar.classList.add('scrolled');
        } else {
            this.navbar.classList.remove('scrolled');
        }
    }

    updateActiveLink() {
        const sections = document.querySelectorAll('section[id]');
        const scrollY = window.pageYOffset;

        sections.forEach(section => {
            const sectionHeight = section.offsetHeight;
            const sectionTop = section.offsetTop - 100;
            const sectionId = section.getAttribute('id');

            if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                this.navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }

    smoothScroll(e) {
        const href = e.currentTarget.getAttribute('href');

        if (href.startsWith('#')) {
            e.preventDefault();
            const target = document.querySelector(href);

            if (target) {
                const offsetTop = target.offsetTop - 80;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });

                // Close mobile menu if open
                this.navMenu.classList.remove('active');
            }
        }
    }

    toggleMobileMenu() {
        this.navMenu.classList.toggle('active');
    }
}

// ===================================
// TYPING EFFECT
// ===================================

class TypingEffect {
    constructor(element, texts, speed = 100, deleteSpeed = 50, pauseTime = 2000) {
        this.element = element;
        this.texts = texts;
        this.speed = speed;
        this.deleteSpeed = deleteSpeed;
        this.pauseTime = pauseTime;
        this.textIndex = 0;
        this.charIndex = 0;
        this.isDeleting = false;

        this.type();
    }

    type() {
        const currentText = this.texts[this.textIndex];

        if (this.isDeleting) {
            this.element.textContent = currentText.substring(0, this.charIndex - 1);
            this.charIndex--;
        } else {
            this.element.textContent = currentText.substring(0, this.charIndex + 1);
            this.charIndex++;
        }

        let typeSpeed = this.isDeleting ? this.deleteSpeed : this.speed;

        if (!this.isDeleting && this.charIndex === currentText.length) {
            typeSpeed = this.pauseTime;
            this.isDeleting = true;
        } else if (this.isDeleting && this.charIndex === 0) {
            this.isDeleting = false;
            this.textIndex = (this.textIndex + 1) % this.texts.length;
        }

        setTimeout(() => this.type(), typeSpeed);
    }
}

// ===================================
// 3D CARD TILT EFFECT
// ===================================

class CardTilt {
    constructor() {
        this.cards = document.querySelectorAll('.card-3d');
        this.init();
    }

    init() {
        this.cards.forEach(card => {
            card.addEventListener('mousemove', (e) => this.handleMouseMove(e, card));
            card.addEventListener('mouseleave', () => this.handleMouseLeave(card));
        });
    }

    handleMouseMove(e, card) {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = (y - centerY) / 10;
        const rotateY = (centerX - x) / 10;

        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-10px)`;
    }

    handleMouseLeave(card) {
        card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
    }
}

// ===================================
// DATA MANAGEMENT
// ===================================

class DataManager {
    constructor() {
        // No initialization needed - using MySQL API
    }

    async fetchData(endpoint) {
        try {
            const response = await fetch(`${API_URL}${endpoint}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            return data;
        } catch (err) {
            console.error(`Error fetching ${endpoint}:`, err);
            return this.getDefaultData()[endpoint.replace('/', '')] || [];
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

    getDefaultData() {
        return {
            profile: {
                name: 'Your Name',
                title: 'Backend Engineer',
                punchline: 'Building scalable backend systems with Java & Spring Boot. Transforming complex problems into elegant solutions.',
                email: 'your.email@example.com',
                phone: '+1 (234) 567-890',
                location: 'Your City, Country',
                about: `I'm a passionate Backend Engineer with a deep focus on building robust, scalable systems using Java and Spring Boot.

My journey in software development began with a fascination for how things work behind the scenes. Over the years, I've honed my skills in designing RESTful APIs, microservices architecture, and database optimization.

While my expertise lies in backend development, I'm constantly expanding my full-stack capabilities, exploring modern frontend frameworks and cloud technologies to deliver end-to-end solutions.

When I'm not coding, you'll find me exploring new technologies, contributing to open-source projects, or writing technical articles to share knowledge with the developer community.`,
                projectsCount: '15+',
                experienceYears: '3+'
            },
            skills: [],
            projects: [],
            experience: [],
            certificates: [],
            blog: [],
            messages: []
        };
    }
}

// ===================================
// CONTENT RENDERER
// ===================================

class ContentRenderer {
    constructor() {
        this.dataManager = new DataManager();
    }

    async init() {
        await this.loadProfile();
        await this.loadSkills();
        await this.loadProjects();
        await this.loadCertificates();
        // Experience and Blog removed - user is a fresher

        // Re-initialize AOS after all content is loaded
        // This is needed because content is loaded dynamically via AJAX
        if (typeof AOS !== 'undefined') {
            setTimeout(() => {
                new AOS(); // Re-scan DOM for new elements with data-aos
            }, 100);
        }

        // Hide scroll indicator on scroll
        this.setupScrollIndicator();
    }

    setupScrollIndicator() {
        const scrollIndicator = document.getElementById('scrollIndicator');
        if (!scrollIndicator) return;

        let hasScrolled = false;

        window.addEventListener('scroll', () => {
            if (!hasScrolled && window.scrollY > 100) {
                hasScrolled = true;
                scrollIndicator.style.opacity = '0';
                scrollIndicator.style.transform = 'translateY(20px)';

                // Remove from DOM after animation
                setTimeout(() => {
                    scrollIndicator.style.display = 'none';
                }, 500);
            }
        });
    }

    async loadProfile() {
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

        // Get actual project count from API
        const projects = await this.dataManager.fetchData('/projects');
        document.getElementById('projectsCount').textContent = (projects.length || 0) + '+';

        // experienceYears element might not exist if removed
        const expYears = document.getElementById('experienceYears');
        if (expYears) {
            expYears.textContent = profile.experienceYears || '3+';
        }

        // Update contact section
        document.getElementById('contactEmail').textContent = profile.email;
        document.getElementById('contactEmail').href = `mailto:${profile.email}`;
        document.getElementById('contactPhone').textContent = profile.phone;
        document.getElementById('contactPhone').href = `tel:${profile.phone.replace(/\s/g, '')}`;
        document.getElementById('contactLocation').textContent = profile.location;

        // Resume download - update all resume links
        if (profile.resume_path) {
            const downloadBtn = document.getElementById('downloadResumeBtn');
            const aboutDownloadBtn = document.getElementById('downloadResume');
            const footerResumeLink = document.getElementById('footerResumeLink');

            if (downloadBtn) {
                downloadBtn.href = profile.resume_path;
                downloadBtn.download = "Resume.pdf";
                downloadBtn.style.display = 'inline-flex';
            }
            if (aboutDownloadBtn) {
                aboutDownloadBtn.href = profile.resume_path;
                aboutDownloadBtn.download = "Resume.pdf";
                aboutDownloadBtn.style.display = 'inline-flex';
            }
            if (footerResumeLink) {
                footerResumeLink.href = profile.resume_path;
                footerResumeLink.download = "Resume.pdf";
            }
        }

        // Initialize typing effect
        const typingTexts = [
            profile.title || 'Java Full Stack Developer',
            'Spring Boot Developer',
            'Problem Solver',
            'Quick Learner',
            'Team Player',
            'Python Programmer',
            'Django Developer',
            'Api Developer',
        ];
        new TypingEffect(document.getElementById('typingText'), typingTexts);
    }

    async loadSkills() {
        const skills = await this.dataManager.fetchData('/skills');
        const container = document.getElementById('skillsContainer');
        const section = document.getElementById('skills');

        if (!skills || skills.length === 0) {
            // Hide entire section if no skills
            section.classList.add('hidden-section');
            container.innerHTML = '';
            return;
        }

        // Show section if skills exist
        section.classList.remove('hidden-section');
        section.classList.add('full-section');

        // Fetch technologies to map names to icon classes
        const technologies = await this.dataManager.fetchData('/technologies');
        const techMap = {};
        technologies.forEach(tech => {
            techMap[tech.name.toLowerCase()] = tech.icon_class || 'fas fa-code';
        });

        // Combine ALL skills into 2 rows (alternating)
        const allSkills = [];
        skills.forEach(skill => {
            allSkills.push(skill);
        });

        // Split into 2 rows
        const row1Skills = [];
        const row2Skills = [];

        allSkills.forEach((skill, index) => {
            if (index % 2 === 0) {
                row1Skills.push(skill);
            } else {
                row2Skills.push(skill);
            }
        });

        // Ensure minimum 8 items per row
        const ensureMinItems = (skillArray) => {
            const minItems = 8;
            let result = [...skillArray];
            while (result.length < minItems) {
                result = [...result, ...result];
            }
            return result;
        };

        const row1 = ensureMinItems(row1Skills);
        const row2 = ensureMinItems(row2Skills);

        // Duplicate 10x for seamless scroll
        const duplicate10x = (skillArray) => {
            const result = [];
            for (let i = 0; i < 10; i++) {
                result.push(...skillArray);
            }
            return result;
        };

        const row1Duplicated = duplicate10x(row1);
        const row2Duplicated = duplicate10x(row2);

        // Create 2 rows
        let rowHTML = '<div class="skills-infinite-scroll">';

        // Row 1: Right to Left
        rowHTML += `
            <div class="scroll-row-wrapper">
                <div class="scroll-row scroll-row-1">
                    ${row1Duplicated.map(skill => {
            const iconClass = skill.icon_class || skill.icon || techMap[skill.name.toLowerCase()] || 'fas fa-code';
            return `
                            <div class="skill-scroll-item">
                                <i class="${iconClass} colored"></i>
                                <span>${skill.name}</span>
                            </div>
                        `;
        }).join('')}
                </div>
            </div>
        `;

        // Row 2: Left to Right
        rowHTML += `
            <div class="scroll-row-wrapper">
                <div class="scroll-row scroll-row-2">
                    ${row2Duplicated.map(skill => {
            const iconClass = skill.icon_class || skill.icon || techMap[skill.name.toLowerCase()] || 'fas fa-code';
            return `
                            <div class="skill-scroll-item">
                                <i class="${iconClass} colored"></i>
                                <span>${skill.name}</span>
                            </div>
                        `;
        }).join('')}
                </div>
            </div>
        `;

        rowHTML += '</div>';

        container.innerHTML = rowHTML;
    }

    async loadProjects() {
        const projects = await this.dataManager.fetchData('/projects');
        const grid = document.getElementById('projectsGrid');

        if (!projects || projects.length === 0) {
            grid.innerHTML = '<p class="text-center">No projects added yet.</p>';
            return;
        }

        // Load technologies for icon mapping
        const technologies = await this.dataManager.fetchData('/technologies');
        const techMap = {};
        technologies.forEach(tech => {
            techMap[tech.name] = tech.icon_class || 'fas fa-code';
        });

        grid.innerHTML = projects.map(project => {
            // Parse technologies from JSON
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

            // Status badge with icons
            const statusBadges = {
                completed: '<span class="project-status status-completed">✓ Completed</span>',
                development: '<span class="project-status status-development">⚡ In Development</span>',
                updating: '<span class="project-status status-updating">🔄 Updating</span>'
            };

            // Fix demo URL format
            let demoUrl = project.demo_url || '';
            if (demoUrl && !demoUrl.startsWith('http')) {
                demoUrl = 'https://' + demoUrl;
            }




            return `
                <div class="project-card" data-aos="fade-up" data-status="${project.status}">
                    <div class="project-image">
                        <img src="${project.image_path || 'assets/placeholder.jpg'}" alt="${project.title}" onerror="this.src='assets/placeholder.jpg'">
                        ${statusBadges[project.status] || statusBadges.development}
                    </div>
                    <div class="project-content">
                        <h3 class="project-title">${project.title}</h3>
                        <p class="project-description">${project.description}</p>
                        <div class="project-tech">
                            ${techArray.map(tech => {
                const iconClass = techMap[tech] || 'fas fa-code';
                return `
                                    <span class="tech-tag-icon" title="${tech}">
                                        <i class="${iconClass}"></i>
                                        <span>${tech}</span>
                                    </span>
                                `;
            }).join('')}
                        </div>
                        <div class="project-links">
                            ${project.github_url && project.github_url !== '#' && project.github_url !== '' ? `
                                <a href="${project.github_url}" class="project-link project-link-active" target="_blank" rel="noopener">
                                    <i class="fab fa-github"></i> 
                                    <span>Code</span>
                                </a>
                            ` : `
                                <span class="project-link project-link-disabled" title="Not added to GitHub">
                                    <i class="fab fa-github"></i> 
                                    <span>Code</span>
                                    <span class="link-status">Not Added</span>
                                </span>
                            `}
                            ${demoUrl && demoUrl !== '#' && demoUrl !== '' ? `
                                <a href="${demoUrl}" class="project-link project-link-active" target="_blank" rel="noopener">
                                    <i class="fas fa-external-link-alt"></i> 
                                    <span>Live Demo</span>
                                </a>
                            ` : `
                                <span class="project-link project-link-disabled" title="In Progress">
                                    <i class="fas fa-external-link-alt"></i> 
                                    <span>Live Demo</span>
                                    <span class="link-status">In Progress</span>
                                </span>
                            `}
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        this.initProjectFilter();
    }

    initProjectFilter() {
        const filterBtns = document.querySelectorAll('.filter-btn');
        const projectCards = document.querySelectorAll('.project-card');

        // Show all projects initially
        projectCards.forEach(card => {
            card.style.display = 'block';
            card.style.opacity = '1';
        });

        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const filter = btn.dataset.filter;

                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                projectCards.forEach(card => {
                    if (filter === 'all' || card.dataset.status === filter) {
                        card.style.display = 'block';
                        setTimeout(() => card.style.opacity = '1', 10);
                    } else {
                        card.style.opacity = '0';
                        setTimeout(() => card.style.display = 'none', 300);
                    }
                });
            });
        });
    }

    async loadExperience() {
        const experiences = await this.dataManager.fetchData('/experience');
        const timeline = document.getElementById('experienceTimeline');
        const section = document.getElementById('experience');

        if (!timeline) {
            console.log('Experience section not found in HTML');
            return;
        }

        if (!experiences || experiences.length === 0) {
            if (section) section.classList.add('hidden-section');
            timeline.innerHTML = '';
            return;
        }

        if (section) {
            section.classList.remove('hidden-section');
            section.classList.add('full-section');
        }

        timeline.innerHTML = experiences.map((exp, index) => `
            <div class="timeline-item" data-aos="fade-up" data-aos-delay="${index * 100}">
                <div class="timeline-dot"></div>
                <div class="timeline-date">
                    <span class="date-badge">${exp.date}</span>
                </div>
                <div class="timeline-content">
                    <h3 class="experience-role">${exp.role}</h3>
                    <div class="experience-company">${exp.company}</div>
                    <p class="experience-description">${exp.description}</p>
                    <div class="experience-skills">
                        ${exp.skills.map(skill => `<span class="tech-tag">${skill}</span>`).join('')}
                    </div>
                </div>
            </div>
        `).join('');
    }

    async loadCertificates() {
        const certificates = await this.dataManager.fetchData('/certificates');

        const grid = document.getElementById('certificatesGrid');
        const section = document.getElementById('certificates');

        if (!grid) {
            console.error('certificatesGrid element not found!');
            return;
        }



        if (!certificates || certificates.length === 0) {

            if (section) section.classList.add('hidden-section');
            grid.innerHTML = '';
            return;
        }

        if (section) {
            section.classList.remove('hidden-section');
            section.classList.add('full-section');
        }

        grid.innerHTML = certificates.map((cert, index) => {
            return `
            <div class="certificate-card" data-aos="fade-up" data-aos-delay="${index * 100}">
                <div class="certificate-preview">
                    ${cert.pdf_path ? `
                        <iframe 
                            src="${cert.pdf_path}#toolbar=0&navpanes=0&scrollbar=0" 
                            class="pdf-preview"
                            title="${cert.title}"
                        ></iframe>
                        <div class="certificate-overlay">
                            <i class="fas fa-file-pdf"></i>
                            <span>View Certificate</span>
                        </div>
                    ` : `
                        <div class="certificate-placeholder">
                            <i class="fas fa-certificate"></i>
                        </div>
                    `}
                </div>
                <div class="certificate-content">
                    <h3 class="certificate-title">${cert.title}</h3>
                    <div class="certificate-issuer">
                        <i class="fas fa-building"></i>
                        ${cert.issuer}
                    </div>
                    <div class="certificate-meta">
                        <div class="certificate-duration">
                            <i class="far fa-clock"></i>
                            ${cert.duration || 'Duration not specified'}
                        </div>
                        <div class="certificate-date">
                            <i class="far fa-calendar"></i>
                            ${cert.from_date ? new Date(cert.from_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : ''} - 
                            ${cert.to_date ? new Date(cert.to_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : ''}
                        </div>
                    </div>
                    <div class="certificate-actions">
                        ${cert.pdf_path ? `
                            <a href="${cert.pdf_path}" target="_blank" class="cert-btn cert-btn-primary">
                                <i class="fas fa-download"></i>
                                Download
                            </a>
                        ` : ''}
                        ${cert.verification_url ? `
                            <a href="${cert.verification_url}" target="_blank" class="cert-btn cert-btn-outline">
                                <i class="fas fa-shield-alt"></i>
                                Verify
                            </a>
                        ` : ''}
                    </div>
                </div>
            </div>
        `}).join('');

    }

    async loadBlog() {
        const posts = await this.dataManager.fetchData('/blog');
        const grid = document.getElementById('blogGrid');

        if (!grid) {
            console.log('Blog section not found in HTML');
            return;
        }

        if (!posts || posts.length === 0) {
            grid.innerHTML = '<p class="text-center">No blog posts yet.</p>';
            return;
        }

        grid.innerHTML = posts.map((post, index) => `
    < div class="blog-card" data - aos="fade-up" data - aos - delay="${index * 100}" >
                <div class="blog-image">
                    <img src="${post.image}" alt="${post.title}" onerror="this.src='assets/placeholder.jpg'">
                </div>
                <div class="blog-content">
                    <div class="blog-meta">
                        <span><i class="far fa-calendar"></i> ${post.date}</span>
                        <span><i class="far fa-clock"></i> ${post.readTime}</span>
                    </div>
                    <h3 class="blog-title">${post.title}</h3>
                    <p class="blog-excerpt">${post.excerpt}</p>
                    <div class="blog-tags">
                        ${post.tags.map(tag => `<span class="tech-tag">${tag}</span>`).join('')}
                    </div>
                    <a href="${post.link}" class="read-more">
                        Read More <i class="fas fa-arrow-right"></i>
                    </a>
                </div>
            </div >
    `).join('');
    }
}

// ===================================
// CONTACT FORM
// ===================================

class ContactForm {
    constructor() {
        this.form = document.getElementById('contactForm');
        this.init();
    }

    init() {
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    }

    async handleSubmit(e) {
        e.preventDefault();

        const formData = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            subject: document.getElementById('subject').value,
            message: document.getElementById('message').value,
            date: new Date().toISOString()
        };

        try {
            const dataManager = new DataManager();
            await dataManager.saveData('/contact', formData);

            this.showMessage('Message sent successfully! I\'ll get back to you soon.', 'success');
            this.form.reset();
        } catch (error) {
            this.showMessage('Failed to send message. Please try again or email me directly.', 'error');
        }
    }

    showMessage(message, type) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `form - message ${type} `;
        messageDiv.textContent = message;
        messageDiv.style.cssText = `
padding: 1rem;
margin - top: 1rem;
border - radius: 0.5rem;
background: ${type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)'};
color: ${type === 'success' ? '#10b981' : '#ef4444'};
border: 1px solid ${type === 'success' ? '#10b981' : '#ef4444'};
`;

        this.form.appendChild(messageDiv);

        setTimeout(() => messageDiv.remove(), 5000);
    }
}

// ===================================
// INITIALIZE APP
// ===================================

document.addEventListener('DOMContentLoaded', () => {
    // Initialize navigation
    new Navigation();

    // Initialize 3D card effects
    new CardTilt();

    // Load content
    const renderer = new ContentRenderer();
    renderer.init();

    // Initialize contact form
    new ContactForm();

    // Add parallax effect to gradient orbs
    window.addEventListener('mousemove', (e) => {
        const orbs = document.querySelectorAll('.gradient-orb');
        const x = e.clientX / window.innerWidth;
        const y = e.clientY / window.innerHeight;

        orbs.forEach((orb, index) => {
            const speed = (index + 1) * 20;
            orb.style.transform = `translate(${x * speed}px, ${y * speed}px)`;
        });
    });
});
