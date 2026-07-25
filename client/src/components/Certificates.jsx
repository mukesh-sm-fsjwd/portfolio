function formatDate(dateStr) {
  if (!dateStr) return '';
  try {
    return new Date(dateStr).toLocaleDateString('en-IN', { year: 'numeric', month: 'short' });
  } catch { return dateStr; }
}

function CertificateCard({ cert }) {
  const pdfUrl = cert.file_path || cert.pdf_path || null;
  const verifyUrl = cert.verify_url || cert.credential_url || null;
  const imageUrl = cert.image_path || cert.thumbnail || null;

  const fromDate = formatDate(cert.from_date);
  const toDate = formatDate(cert.to_date);
  const dateRange = fromDate && toDate ? `${fromDate} – ${toDate}` : fromDate || toDate || '';

  return (
    <article
      className="certificate-card"
      data-aos="fade-up"
      aria-label={`${cert.title} certificate`}
    >
      {/* Preview */}
      <div className="certificate-preview">
        {pdfUrl ? (
          <iframe
            src={`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=0`}
            title={`${cert.title} PDF preview`}
            className="pdf-preview"
            loading="lazy"
            sandbox="allow-same-origin"
          />
        ) : imageUrl ? (
          <img
            src={imageUrl}
            alt={`${cert.title} certificate`}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            loading="lazy"
          />
        ) : (
          <div className="certificate-placeholder">
            <i className="fas fa-certificate" aria-hidden="true"></i>
          </div>
        )}

        <div className="certificate-overlay" aria-hidden="true">
          <i className="fas fa-eye"></i>
          <span>View Certificate</span>
        </div>
      </div>

      {/* Content */}
      <div className="certificate-content">
        <h3 className="certificate-title">{cert.title}</h3>
        <div className="certificate-issuer">
          <i className="fas fa-award" aria-hidden="true"></i>
          {cert.issuer}
        </div>

        <div className="certificate-meta">
          {cert.duration && (
            <div className="certificate-duration">
              <i className="fas fa-clock" aria-hidden="true"></i>
              <span>{cert.duration}</span>
            </div>
          )}
          {dateRange && (
            <div className="certificate-date">
              <i className="fas fa-calendar" aria-hidden="true"></i>
              <span>{dateRange}</span>
            </div>
          )}
        </div>

        <div className="certificate-actions">
          {pdfUrl && (
            <a
              href={pdfUrl}
              download
              className="cert-btn cert-btn-primary"
              aria-label={`Download ${cert.title} certificate`}
            >
              <i className="fas fa-download" aria-hidden="true"></i> Download
            </a>
          )}
          {verifyUrl && (
            <a
              href={verifyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="cert-btn cert-btn-outline"
              aria-label={`Verify ${cert.title} certificate`}
            >
              <i className="fas fa-external-link-alt" aria-hidden="true"></i> Verify
            </a>
          )}
          {!pdfUrl && !verifyUrl && imageUrl && (
            <a
              href={imageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="cert-btn cert-btn-outline"
              aria-label={`View ${cert.title} certificate`}
            >
              <i className="fas fa-eye" aria-hidden="true"></i> View
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

export default function Certificates({ certificates }) {
  if (!certificates || certificates.length === 0) return null;

  return (
    <section id="certificates" aria-labelledby="certificates-heading">
      <div className="container">
        <div className="section-header" data-aos="fade-up">
          <span className="section-label">Achievements</span>
          <h2 id="certificates-heading" className="section-title">
            My <span className="text-gradient">Certificates</span>
          </h2>
          <div className="section-divider"></div>
        </div>

        <div className="certificates-grid" id="certificatesList">
          {certificates.map(cert => (
            <CertificateCard key={cert.id} cert={cert} />
          ))}
        </div>
      </div>
    </section>
  );
}
