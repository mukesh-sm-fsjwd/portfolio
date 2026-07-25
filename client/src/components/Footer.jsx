export default function Footer({ profile }) {
  const resumePath = profile?.resume_path || null;

  function smoothScroll(e, href) {
    e.preventDefault();
    const el = document.querySelector(href);
    if (el) window.scrollTo({ top: el.offsetTop - 80, behavior: 'smooth' });
  }

  const year = new Date().getFullYear();

  return (
    <footer className="footer" role="contentinfo">
      <div className="container">
        <div className="footer-content">
          {/* Brand */}
          <div className="footer-brand">
            <div className="footer-logo">
              <span className="logo-bracket">&lt;</span>
              <span className="logo-text">Mukesh</span>
              <span className="logo-bracket">/&gt;</span>
            </div>
            <p>
              Backend Engineer passionate about building scalable systems
              and elegant solutions with Java &amp; Spring Boot.
            </p>
          </div>

          {/* Links */}
          <div className="footer-links">
            <div className="footer-column">
              <h4>Quick Links</h4>
              <ul>
                {[
                  ['#home', 'Home'],
                  ['#about', 'About'],
                  ['#skills', 'Skills'],
                  ['#projects', 'Projects'],
                  ['#certificates', 'Certificates'],
                  ['#contact', 'Contact'],
                ].map(([href, label]) => (
                  <li key={href}>
                    <a href={href} onClick={(e) => smoothScroll(e, href)}>{label}</a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="footer-column">
              <h4>Resources</h4>
              <ul>
                {resumePath && (
                  <li>
                    <a href={resumePath} download="Resume.pdf" id="footerResumeLink">
                      Download Resume
                    </a>
                  </li>
                )}
                <li>
                  <a href="https://github.com/mukesh-sm-fsjwd" target="_blank" rel="noopener noreferrer">
                    GitHub Profile
                  </a>
                </li>
                <li>
                  <a href="https://linkedin.com/in/mukesh-sm" target="_blank" rel="noopener noreferrer">
                    LinkedIn
                  </a>
                </li>
                <li>
                  <a href={`mailto:${profile?.email || 'contact@smmukesh.me'}`}>
                    Send Email
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom">
          <p>
            Made with <i className="fas fa-heart" aria-hidden="true"></i> by{' '}
            <span className="text-gradient">Mukesh SM</span>
          </p>
          <p>
            &copy; {year} Mukesh SM. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
