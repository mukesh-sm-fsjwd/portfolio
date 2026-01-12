// ===================================
// AOS (Animate On Scroll) - Lightweight Implementation
// ===================================

class AOS {
    constructor() {
        this.elements = [];
        this.offset = 100;
        this.init();
    }

    init() {
        // Find all elements with data-aos attribute
        this.elements = Array.from(document.querySelectorAll('[data-aos]'));
        
        // Initial check
        this.checkElements();
        
        // Listen to scroll
        window.addEventListener('scroll', () => this.checkElements());
        window.addEventListener('resize', () => this.checkElements());
    }

    checkElements() {
        this.elements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            const elementBottom = element.getBoundingClientRect().bottom;
            const windowHeight = window.innerHeight;

            if (elementTop < windowHeight - this.offset && elementBottom > 0) {
                element.classList.add('aos-animate');
            }
        });
    }
}

// Initialize AOS when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new AOS());
} else {
    new AOS();
}
