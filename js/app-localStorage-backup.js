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
        this.initializeData();
    }

    initializeData() {
        // Initialize portfolioData if it doesn't exist
        if (!localStorage.getItem('portfolioData')) {
            const defaultData = this.getDefaultData();
            localStorage.setItem('portfolioData', JSON.stringify(defaultData));
        }
    }

    async fetchData(endpoint) {
        // Use localStorage instead of API
        const data = JSON.parse(localStorage.getItem('portfolioData') || '{}');
        const key = endpoint.replace('/', '');
        return data[key] || this.getDefaultData()[key];
    }

    async saveData(endpoint, data) {
        const allData = JSON.parse(localStorage.getItem('portfolioData') || '{}');
        const key = endpoint.replace('/', '');
        allData[key] = data;
        localStorage.setItem('portfolioData', JSON.stringify(allData));
        return { success: true };
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
            skills: [
                {
                    id: 1,
                    category: 'Backend',
                    icon: '⚙️',
                    skills: [
                        { name: 'Java', level: 'Expert', icon: '☕' },
                        { name: 'Spring Boot', level: 'Expert', icon: '🍃' },
                        { name: 'Spring Security', level: 'Advanced', icon: '🔒' },
                        { name: 'Hibernate/JPA', level: 'Advanced', icon: '💾' },
                        { name: 'RESTful APIs', level: 'Expert', icon: '🔌' },
                        { name: 'Microservices', level: 'Advanced', icon: '🏗️' }
                    ]
                },
                {
                    id: 2,
                    category: 'Frontend',
                    icon: '🎨',
                    skills: [
                        { name: 'HTML/CSS', level: 'Advanced', icon: '📄' },
                        { name: 'JavaScript', level: 'Intermediate', icon: '⚡' },
                        { name: 'React', level: 'Intermediate', icon: '⚛️' },
                        { name: 'Thymeleaf', level: 'Advanced', icon: '🌿' }
                    ]
                },
                {
                    id: 3,
                    category: 'Database',
                    icon: '💾',
                    skills: [
                        { name: 'MySQL', level: 'Advanced', icon: '🐬' },
                        { name: 'PostgreSQL', level: 'Advanced', icon: '🐘' },
                        { name: 'MongoDB', level: 'Intermediate', icon: '🍃' },
                        { name: 'Redis', level: 'Intermediate', icon: '⚡' }
                    ]
                },
                {
                    id: 4,
                    category: 'Tools & DevOps',
                    icon: '🛠️',
                    skills: [
                        { name: 'Git', level: 'Advanced', icon: '📦' },
                        { name: 'Docker', level: 'Intermediate', icon: '🐳' },
                        { name: 'Maven/Gradle', level: 'Advanced', icon: '📦' },
                        { name: 'Jenkins', level: 'Intermediate', icon: '🔧' },
                        { name: 'AWS', level: 'Beginner', icon: '☁️' }
                    ]
                },
                {
                    id: 5,
                    category: 'Concepts',
                    icon: '💡',
                    skills: [
                        { name: 'OOP', level: 'Expert', icon: '🎯' },
                        { name: 'Design Patterns', level: 'Advanced', icon: '🏛️' },
                        { name: 'SOLID Principles', level: 'Advanced', icon: '📐' },
                        { name: 'Agile/Scrum', level: 'Advanced', icon: '🔄' },
                        { name: 'TDD', level: 'Intermediate', icon: '✅' }
                    ]
                }
            ],
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
        await this.loadExperience();
        await this.loadCertificates();
        await this.loadBlog();
    }

    async loadProfile() {
        const profile = await this.dataManager.fetchData('/profile');

        // Update hero section
        document.getElementById('heroName').textContent = profile.name;
        document.getElementById('heroPunchline').textContent = profile.punchline;

        // Update about section - including profile image
        const aboutImage = document.getElementById('aboutImage');
        if (aboutImage && profile.image) {
            aboutImage.src = profile.image;
        }

        document.getElementById('aboutContent').innerHTML = profile.about.split('\n\n')
            .map(p => `<p${p.includes('passionate') ? ' class="lead-text"' : ''}>${p}</p>`)
            .join('');
        document.getElementById('projectsCount').textContent = profile.projectsCount;

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

        // Initialize typing effect
        const typingTexts = [
            profile.title || 'Backend Engineer',
            'Java Developer',
            'Spring Boot Expert',
            'API Architect',
            'Full Stack Enthusiast'
        ];
        new TypingEffect(document.getElementById('typingText'), typingTexts);
    }

    async loadSkills() {
        const skills = await this.dataManager.fetchData('/skills');
        const container = document.getElementById('skillsContainer');

        container.innerHTML = skills.map(category => `
            <div class="skill-category" data-aos="fade-up">
                <div class="category-header">
                    <div class="category-icon">${category.icon}</div>
                    <h3 class="category-title">${category.category}</h3>
                </div>
                <div class="skills-grid">
                    ${category.skills.map(skill => `
                        <div class="skill-item">
                            <div class="skill-icon">${skill.icon}</div>
                            <div class="skill-name">${skill.name}</div>
                            <div class="skill-level">${skill.level}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('');
    }

    async loadProjects() {
        const projects = await this.dataManager.fetchData('/projects');
        const grid = document.getElementById('projectsGrid');

        grid.innerHTML = projects.map(project => `
            <div class="project-card" data-aos="fade-up" data-status="${project.status}">
                <div class="project-image">
                    <img src="${project.image}" alt="${project.title}" onerror="this.src='assets/placeholder.jpg'">
                    <div class="project-status status-${project.status}">
                        ${project.status === 'completed' ? 'Completed' : 'In Development'}
                    </div>
                </div>
                <div class="project-content">
                    <h3 class="project-title">${project.title}</h3>
                    <p class="project-description">${project.description}</p>
                    <div class="project-tech">
                        ${project.tech.map(tech => `<span class="tech-tag">${tech}</span>`).join('')}
                    </div>
                    <div class="project-links">
                        ${project.github && project.github !== '#' && project.github !== '' ? `
                            <a href="${project.github}" class="project-link" target="_blank" rel="noopener">
                                <i class="fab fa-github"></i> Code
                            </a>
                        ` : ''}
                        ${project.demo && project.demo !== '#' && project.demo !== '' ? `
                            <a href="${project.demo}" class="project-link" target="_blank" rel="noopener">
                                <i class="fas fa-external-link-alt"></i> Demo
                            </a>
                        ` : ''}
                    </div>
                </div>
            </div>
        `).join('');

        this.initProjectFilter();
    }

    initProjectFilter() {
        const filterBtns = document.querySelectorAll('.filter-btn');
        const projectCards = document.querySelectorAll('.project-card');

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

        grid.innerHTML = certificates.map((cert, index) => `
            <div class="certificate-card" data-aos="fade-up" data-aos-delay="${index * 100}">
                <div class="certificate-image">
                    <img src="${cert.image}" alt="${cert.title}" onerror="this.src='assets/placeholder.jpg'">
                    <div class="certificate-overlay">
                        <i class="fas fa-search-plus"></i>
                    </div>
                </div>
                <div class="certificate-content">
                    <h3 class="certificate-title">${cert.title}</h3>
                    <div class="certificate-issuer">${cert.issuer}</div>
                    <div class="certificate-date">${cert.date}</div>
                </div>
            </div>
        `).join('');
    }

    async loadBlog() {
        const posts = await this.dataManager.fetchData('/blog');
        const grid = document.getElementById('blogGrid');

        grid.innerHTML = posts.map((post, index) => `
            <div class="blog-card" data-aos="fade-up" data-aos-delay="${index * 100}">
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
            </div>
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
