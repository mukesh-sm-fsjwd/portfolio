import { useState, useEffect } from 'react';
import { useScrollSpy } from '../hooks/useScrollSpy';

const SECTION_IDS = ['home', 'about', 'skills', 'projects', 'certificates', 'contact'];
const NAV_LINKS = [
  { href: '#home', label: 'Home' },
  { href: '#about', label: 'About' },
  { href: '#skills', label: 'Skills' },
  { href: '#projects', label: 'Projects' },
  { href: '#certificates', label: 'Certificates' },
  { href: '#contact', label: 'Contact' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const activeId = useScrollSpy(SECTION_IDS, 80);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 50);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  function smoothScroll(e, href) {
    e.preventDefault();
    const target = document.querySelector(href);
    if (target) {
      window.scrollTo({ top: target.offsetTop - 80, behavior: 'smooth' });
    }
    setMenuOpen(false);
  }

  return (
    <nav id="navbar" className={`navbar${scrolled ? ' scrolled' : ''}`}>
      <div className="nav-container">
        {/* Logo */}
        <a href="#home" className="nav-logo" onClick={(e) => smoothScroll(e, '#home')} aria-label="Home">
          <span className="logo-bracket">&lt;</span>
          <span className="logo-text">Mukesh</span>
          <span className="logo-bracket">/&gt;</span>
        </a>

        {/* Nav links */}
        <ul className={`nav-menu${menuOpen ? ' active' : ''}`} id="navMenu" role="menubar">
          {NAV_LINKS.map(({ href, label }) => (
            <li key={href} role="none">
              <a
                href={href}
                className={`nav-link${activeId === href.slice(1) ? ' active' : ''}`}
                role="menuitem"
                onClick={(e) => smoothScroll(e, href)}
              >
                {label}
              </a>
            </li>
          ))}
        </ul>

        {/* Actions */}
        <div className="nav-actions">
          <a
            href="#contact"
            className="btn-nav-cta"
            onClick={(e) => smoothScroll(e, '#contact')}
          >
            Hire Me
          </a>

          {/* Hamburger */}
          <button
            className="hamburger"
            id="hamburger"
            aria-label="Toggle mobile menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>
    </nav>
  );
}
