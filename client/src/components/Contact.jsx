import { useState } from 'react';
import { submitContact } from '../utils/api';
import { useCardTilt } from '../hooks/useCardTilt';

export default function Contact({ profile }) {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState(null); // 'loading' | 'success' | 'error'
  const [statusMsg, setStatusMsg] = useState('');

  const formTilt = useCardTilt(8);
  const infoTilt = useCardTilt(8);

  function onChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setStatus('loading');

    try {
      const data = await submitContact(form);
      if (data.success) {
        setStatus('success');
        setStatusMsg(data.message || 'Message sent! I\'ll get back to you soon.');
        setForm({ name: '', email: '', subject: '', message: '' });
      } else {
        setStatus('error');
        setStatusMsg(data.message || 'Something went wrong. Please try again.');
      }
    } catch {
      setStatus('error');
      setStatusMsg('Network error. Please try again later.');
    }

    setTimeout(() => setStatus(null), 5000);
  }

  const email = profile?.email || 'contact@smmukesh.me';
  const phone = profile?.phone || '';
  const location = profile?.location || '';

  return (
    <section id="contact" aria-labelledby="contact-heading">
      <div className="container">
        <div className="section-header" data-aos="fade-up">
          <span className="section-label">Get In Touch</span>
          <h2 id="contact-heading" className="section-title">Contact <span className="text-gradient">Me</span></h2>
          <div className="section-divider"></div>
        </div>

        <div className="contact-content">
          {/* Info Card */}
          <div
            className="info-card card-3d"
            data-aos="fade-right"
            ref={infoTilt.ref}
            onMouseMove={infoTilt.onMouseMove}
            onMouseLeave={infoTilt.onMouseLeave}
            onMouseEnter={infoTilt.onMouseEnter}
          >
            <div className="card-glow" aria-hidden="true"></div>
            <h3>Let&apos;s <span className="text-gradient">Talk</span></h3>
            <p>
              Have a project in mind? Looking for a backend developer? Or just want to say hi?
              I&apos;d love to hear from you. Drop me a message and I&apos;ll get back to you as soon as possible.
            </p>

            <div className="contact-details">
              <div className="detail-item">
                <i className="fas fa-envelope" aria-hidden="true"></i>
                <div>
                  <span className="detail-label">Email</span>
                  <a href={`mailto:${email}`} id="contactEmail">{email}</a>
                </div>
              </div>

              {phone && (
                <div className="detail-item">
                  <i className="fas fa-phone" aria-hidden="true"></i>
                  <div>
                    <span className="detail-label">Phone</span>
                    <a href={`tel:${phone.replace(/\s/g, '')}`} id="contactPhone">{phone}</a>
                  </div>
                </div>
              )}

              {location && (
                <div className="detail-item">
                  <i className="fas fa-map-marker-alt" aria-hidden="true"></i>
                  <div>
                    <span className="detail-label">Location</span>
                    <span id="contactLocation">{location}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Social Links */}
            <div className="social-links">
              <a
                href="https://github.com/mukesh-sm-fsjwd"
                target="_blank"
                rel="noopener noreferrer"
                className="social-link"
                aria-label="GitHub"
              >
                <i className="fab fa-github" aria-hidden="true"></i>
              </a>
              <a
                href="https://linkedin.com/in/mukesh-sm"
                target="_blank"
                rel="noopener noreferrer"
                className="social-link"
                aria-label="LinkedIn"
              >
                <i className="fab fa-linkedin" aria-hidden="true"></i>
              </a>
              <a
                href={`mailto:${email}`}
                className="social-link"
                aria-label="Email"
              >
                <i className="fas fa-envelope" aria-hidden="true"></i>
              </a>
            </div>
          </div>

          {/* Contact Form */}
          <div
            className="contact-form-wrapper"
            data-aos="fade-left"
          >
            <form
              className="contact-form card-3d"
              id="contactForm"
              onSubmit={onSubmit}
              noValidate
              ref={formTilt.ref}
              onMouseMove={formTilt.onMouseMove}
              onMouseLeave={formTilt.onMouseLeave}
              onMouseEnter={formTilt.onMouseEnter}
            >
              <div className="card-glow" aria-hidden="true"></div>

              <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div className="form-group">
                  <label htmlFor="contact-name">Full Name</label>
                  <input
                    type="text"
                    id="contact-name"
                    name="name"
                    value={form.name}
                    onChange={onChange}
                    placeholder="John Doe"
                    required
                    autoComplete="name"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="contact-email">Email Address</label>
                  <input
                    type="email"
                    id="contact-email"
                    name="email"
                    value={form.email}
                    onChange={onChange}
                    placeholder="john@example.com"
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="contact-subject">Subject</label>
                <input
                  type="text"
                  id="contact-subject"
                  name="subject"
                  value={form.subject}
                  onChange={onChange}
                  placeholder="Project Inquiry / Collaboration / Just Saying Hi"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="contact-message">Message</label>
                <textarea
                  id="contact-message"
                  name="message"
                  value={form.message}
                  onChange={onChange}
                  placeholder="Tell me about your project or just say hello..."
                  rows={6}
                  required
                />
              </div>

              {/* Status Message */}
              {status && status !== 'loading' && (
                <div
                  role="alert"
                  style={{
                    padding: '1rem',
                    borderRadius: '0.5rem',
                    background: status === 'success' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                    color: status === 'success' ? '#10b981' : '#ef4444',
                    border: `1px solid ${status === 'success' ? '#10b981' : '#ef4444'}`,
                    marginBottom: '1rem',
                  }}
                >
                  <i className={`fas ${status === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}`} aria-hidden="true"></i>
                  {' '}{statusMsg}
                </div>
              )}

              <button
                type="submit"
                className="btn btn-primary"
                id="contact-submit-btn"
                disabled={status === 'loading'}
                style={{ width: '100%', justifyContent: 'center' }}
              >
                {status === 'loading' ? (
                  <><i className="fas fa-spinner fa-spin" aria-hidden="true"></i> Sending...</>
                ) : (
                  <><i className="fas fa-paper-plane" aria-hidden="true"></i> Send Message</>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
