import { useCardTilt } from '../hooks/useCardTilt';

export default function About({ profile, projectCount }) {
  const tilt = useCardTilt(12);

  const smoothScroll = (href) => {
    const el = document.querySelector(href);
    if (el) window.scrollTo({ top: el.offsetTop - 80, behavior: 'smooth' });
  };

  if (!profile) return null;

  const aboutParagraphs = (profile.about || '').split('\n\n').filter(Boolean);
  const resumePath = profile.resume_path || null;

  return (
    <section id="about" aria-labelledby="about-heading">
      <div className="container">
        <div className="section-header" data-aos="fade-up">
          <span className="section-label">Who I Am</span>
          <h2 id="about-heading" className="section-title">About <span className="text-gradient">Me</span></h2>
          <div className="section-divider"></div>
        </div>

        <div className="about-content">
          {/* Left: Image */}
          <div className="about-image" data-aos="fade-right">
            <div
              className="image-wrapper card-3d"
              ref={tilt.ref}
              onMouseMove={tilt.onMouseMove}
              onMouseLeave={tilt.onMouseLeave}
              onMouseEnter={tilt.onMouseEnter}
            >
              <div className="image-glow" aria-hidden="true"></div>

              {profile.image_path ? (
                <img
                  src={profile.image_path}
                  alt={`${profile.name} - Backend Engineer`}
                  id="aboutImage"
                  loading="lazy"
                />
              ) : (
                <div
                  style={{
                    width: '100%', height: '100%',
                    background: 'linear-gradient(135deg, rgba(0,212,255,0.2), rgba(168,85,247,0.2))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '6rem',
                  }}
                >
                  👨‍💻
                </div>
              )}

              {/* Stats overlay on image */}
              <div className="image-overlay">
                <div className="stats-grid">
                  <div className="stat-item">
                    <span className="stat-number">{projectCount}+</span>
                    <span className="stat-label">Projects</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-number">1+</span>
                    <span className="stat-label">Years Exp</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-number">5+</span>
                    <span className="stat-label">Technologies</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-number">100%</span>
                    <span className="stat-label">Dedication</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Text */}
          <div className="about-text" data-aos="fade-left">
            <div className="text-content" id="aboutContent">
              {aboutParagraphs.map((para, i) => (
                <p
                  key={i}
                  className={i === 0 ? 'lead-text' : ''}
                  style={{ marginBottom: '1rem' }}
                >
                  {para}
                </p>
              ))}
            </div>

            {/* Highlights */}
            <div className="about-highlights">
              <div className="highlight-item" data-aos="fade-up">
                <i className="fas fa-code" aria-hidden="true"></i>
                <div>
                  <h4>Clean Code</h4>
                  <p>Writing maintainable, well-documented code following SOLID principles and best practices.</p>
                </div>
              </div>
              <div className="highlight-item" data-aos="fade-up">
                <i className="fas fa-bolt" aria-hidden="true"></i>
                <div>
                  <h4>Performance First</h4>
                  <p>Building high-performance systems with optimized queries and efficient algorithms.</p>
                </div>
              </div>
              <div className="highlight-item" data-aos="fade-up">
                <i className="fas fa-users" aria-hidden="true"></i>
                <div>
                  <h4>Team Player</h4>
                  <p>Collaborative mindset with excellent communication skills and agile development experience.</p>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="about-actions">
              {resumePath && (
                <a
                  href={resumePath}
                  download="Resume.pdf"
                  className="btn btn-primary"
                  id="downloadResume"
                >
                  <i className="fas fa-download" aria-hidden="true"></i> Download Resume
                </a>
              )}
              <a
                href="#contact"
                className="btn btn-secondary"
                id="about-contact-btn"
                onClick={(e) => { e.preventDefault(); smoothScroll('#contact'); }}
              >
                <i className="fas fa-paper-plane" aria-hidden="true"></i> Contact Me
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
