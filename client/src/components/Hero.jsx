import { useState, useEffect, useCallback } from 'react';
import { useTypingEffect } from '../hooks/useTypingEffect';

const TYPING_TEXTS = [
  'Java Full Stack Developer',
  'Spring Boot Developer',
  'Problem Solver',
  'Quick Learner',
  'Team Player',
  'Python Programmer',
  'Django Developer',
  'API Developer',
];

export default function Hero({ profile }) {
  const typingText = useTypingEffect(TYPING_TEXTS, 100, 50, 2000);
  const [showScroll, setShowScroll] = useState(true);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Hide scroll indicator after first scroll
  useEffect(() => {
    function onScroll() {
      if (window.scrollY > 100) {
        setShowScroll(false);
        window.removeEventListener('scroll', onScroll);
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Mouse parallax for orbs
  const onMouseMove = useCallback((e) => {
    const x = (e.clientX / window.innerWidth - 0.5) * 20;
    const y = (e.clientY / window.innerHeight - 0.5) * 20;
    setMousePos({ x, y });
  }, []);

  function smoothScroll(href) {
    const el = document.querySelector(href);
    if (el) window.scrollTo({ top: el.offsetTop - 80, behavior: 'smooth' });
  }

  const name = profile?.name || 'Mukesh SM';
  const punchline = profile?.punchline || 'Building scalable backend systems with Java & Spring Boot. Transforming complex problems into elegant solutions.';
  const resumePath = profile?.resume_path || null;

  return (
    <section id="home" className="hero-section" onMouseMove={onMouseMove}>
      {/* Background */}
      <div className="hero-background">
        <div className="grid-overlay" />
        <div
          className="gradient-orb orb-1"
          style={{ transform: `translate(${mousePos.x * 0.5}px, ${mousePos.y * 0.5}px)` }}
        />
        <div
          className="gradient-orb orb-2"
          style={{ transform: `translate(${-mousePos.x * 0.3}px, ${-mousePos.y * 0.3}px)` }}
        />
        <div
          className="gradient-orb orb-3"
          style={{ transform: `translate(${mousePos.x * 0.2}px, ${mousePos.y * 0.2}px)` }}
        />
      </div>

      {/* Hero Content */}
      <div className="hero-content" style={{ width: '100%', padding: '0 2rem' }}>
        {/* Left: Text */}
        <div className="hero-text">
          <div className="hero-greeting">
            <span className="greeting-icon">
              <i className="fas fa-hand-peace" aria-hidden="true"></i>
            </span>
            <span>Hello, I&apos;m</span>
          </div>

          <h1 className="hero-name">
            <span className="name-highlight">{name}</span>
          </h1>

          <div className="hero-title">
            <span className="typing-text">{typingText}</span>
            <span className="cursor" aria-hidden="true">|</span>
          </div>

          <p className="hero-description">{punchline}</p>

          <div className="hero-cta">
            <a
              href="#projects"
              className="btn btn-primary"
              id="view-work-btn"
              onClick={(e) => { e.preventDefault(); smoothScroll('#projects'); }}
            >
              <i className="fas fa-rocket" aria-hidden="true"></i> View My Work
            </a>

            {resumePath && (
              <a
                href={resumePath}
                download="Resume.pdf"
                className="btn btn-secondary"
                id="hero-download-resume-btn"
              >
                <i className="fas fa-download" aria-hidden="true"></i> Download Resume
              </a>
            )}
          </div>

          {/* Social Links */}
          <div className="hero-social">
            <a
              href="https://github.com/mukesh-sm-fsjwd"
              target="_blank"
              rel="noopener noreferrer"
              className="social-link"
              aria-label="GitHub"
              id="social-github"
            >
              <i className="fab fa-github" aria-hidden="true"></i>
            </a>
            <a
              href="https://linkedin.com/in/mukesh-sm"
              target="_blank"
              rel="noopener noreferrer"
              className="social-link"
              aria-label="LinkedIn"
              id="social-linkedin"
            >
              <i className="fab fa-linkedin" aria-hidden="true"></i>
            </a>
            <a
              href={`mailto:${profile?.email || 'contact@smmukesh.me'}`}
              className="social-link"
              aria-label="Email"
              id="social-email"
            >
              <i className="fas fa-envelope" aria-hidden="true"></i>
            </a>
          </div>
        </div>

        {/* Right: Code Window */}
        <div className="hero-visual">
          <div className="floating-card">
            <div className="code-window card-3d">
              <div className="window-header">
                <div className="window-buttons">
                  <span className="btn-close" aria-hidden="true"></span>
                  <span className="btn-minimize" aria-hidden="true"></span>
                  <span className="btn-maximize" aria-hidden="true"></span>
                </div>
                <span className="window-title">PortfolioController.java</span>
              </div>
              <div className="code-content">
                <p><span className="code-keyword">@RestController</span></p>
                <p><span className="code-keyword">@RequestMapping</span>(<span className="code-string">&quot;/api&quot;</span>)</p>
                <p><span className="code-keyword">public class</span> <span className="code-class">PortfolioController</span> {'{'}</p>
                <p>&nbsp;&nbsp;<span className="code-keyword">@GetMapping</span>(<span className="code-string">&quot;/profile&quot;</span>)</p>
                <p>&nbsp;&nbsp;<span className="code-keyword">public</span> <span className="code-class">ResponseEntity</span>&lt;<span className="code-class">Profile</span>&gt;</p>
                <p>&nbsp;&nbsp;&nbsp;&nbsp;<span className="code-method">getProfile</span>() {'{'}</p>
                <p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="code-keyword">return</span> <span className="code-class">ResponseEntity</span></p>
                <p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;.<span className="code-method">ok</span>(profileService</p>
                <p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;.<span className="code-method">getProfile</span>());</p>
                <p>&nbsp;&nbsp;{'}'}</p>
                <p>{'}'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      {showScroll && (
        <div
          className="scroll-indicator"
          id="scrollIndicator"
          aria-hidden="true"
          style={{ opacity: showScroll ? 1 : 0 }}
        >
          <div className="mouse">
            <div className="wheel"></div>
          </div>
          <p style={{ fontSize: '0.875rem' }}>Scroll Down</p>
        </div>
      )}
    </section>
  );
}
