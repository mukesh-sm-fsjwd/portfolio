import { useState, useEffect } from 'react';
import { fetchCertificates, addCertificate, updateCertificate, deleteCertificate } from '../../utils/api';
import ConfirmModal from '../ConfirmModal';

function CertModal({ cert, onClose, onSave }) {
  const [form, setForm] = useState({
    title: cert?.title || '',
    issuer: cert?.issuer || '',
    duration: cert?.duration || '',
    from_date: cert?.from_date ? cert.from_date.slice(0, 10) : '',
    to_date: cert?.to_date ? cert.to_date.slice(0, 10) : '',
    verify_url: cert?.verify_url || cert?.credential_url || '',
  });
  const [certFile, setCertFile] = useState(null);
  const [saving, setSaving] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setSaving(true);
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    if (certFile) fd.append('certificate', certFile);
    try { await onSave(fd); onClose(); }
    catch { } finally { setSaving(false); }
  }

  return (
    <div className="modal active" role="dialog" aria-modal="true" aria-labelledby="cert-modal-title"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-content card-3d" style={{ maxWidth: 640 }}>
        <div className="modal-header">
          <h2 id="cert-modal-title">{cert ? 'Edit Certificate' : 'Add Certificate'}</h2>
          <button className="modal-close" id="cert-modal-close" onClick={onClose} aria-label="Close">
            <i className="fas fa-times" aria-hidden="true"></i>
          </button>
        </div>
        <div className="modal-body">
          <form id="certForm" className="admin-form" onSubmit={onSubmit}>
            <div className="form-group">
              <label htmlFor="cert-title">Certificate Title</label>
              <input id="cert-title" type="text" value={form.title}
                onChange={e => setForm(p => ({ ...p, title: e.target.value }))} required
                placeholder="e.g., Java Programming Masterclass" />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="cert-issuer">Issuing Organization</label>
                <input id="cert-issuer" type="text" value={form.issuer}
                  onChange={e => setForm(p => ({ ...p, issuer: e.target.value }))} required
                  placeholder="e.g., Udemy, Coursera" />
              </div>
              <div className="form-group">
                <label htmlFor="cert-duration">Duration (optional)</label>
                <input id="cert-duration" type="text" value={form.duration}
                  onChange={e => setForm(p => ({ ...p, duration: e.target.value }))}
                  placeholder="e.g., 82 hours" />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="cert-from">From Date</label>
                <input id="cert-from" type="date" value={form.from_date}
                  onChange={e => setForm(p => ({ ...p, from_date: e.target.value }))} />
              </div>
              <div className="form-group">
                <label htmlFor="cert-to">To Date</label>
                <input id="cert-to" type="date" value={form.to_date}
                  onChange={e => setForm(p => ({ ...p, to_date: e.target.value }))} />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="cert-verify">Verification URL (optional)</label>
              <input id="cert-verify" type="url" value={form.verify_url}
                onChange={e => setForm(p => ({ ...p, verify_url: e.target.value }))}
                placeholder="https://www.udemy.com/certificate/..." />
            </div>
            <div className="form-group">
              <label htmlFor="cert-file">Certificate PDF / Image</label>
              <input id="cert-file" type="file" accept=".pdf,image/*"
                onChange={e => setCertFile(e.target.files[0])} />
              {cert?.file_path && (
                <small style={{ color: 'var(--color-text-tertiary)' }}>
                  Current: {cert.file_path.split('/').pop()}
                </small>
              )}
            </div>
            <button type="submit" className="btn btn-primary" id="cert-save-btn" disabled={saving}>
              {saving ? <><i className="fas fa-spinner fa-spin" aria-hidden="true"></i> Saving...</> : <><i className="fas fa-save" aria-hidden="true"></i> Save Certificate</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function AdminCertificates({ onNotify }) {
  const [certs, setCerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [confirm, setConfirm] = useState(null);

  async function load() {
    setLoading(true);
    try { setCerts(await fetchCertificates() || []); }
    catch { } finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  async function handleSave(fd) {
    try {
      let res;
      if (modal.cert) res = await updateCertificate(modal.cert.id, fd);
      else res = await addCertificate(fd);
      if (res.success) { onNotify(modal.cert ? 'Certificate updated!' : 'Certificate added!'); await load(); }
      else onNotify('Operation failed.', 'error');
    } catch { onNotify('Error saving certificate.', 'error'); }
  }

  function confirmDelete(cert) {
    setConfirm({
      title: 'Delete Certificate',
      message: `Delete "${cert.title}"? This action cannot be undone.`,
      onConfirm: async () => {
        setConfirm(null);
        try {
          const res = await deleteCertificate(cert.id);
          if (res.success) { onNotify('Certificate deleted!'); await load(); }
          else onNotify('Failed to delete.', 'error');
        } catch { onNotify('Error.', 'error'); }
      },
    });
  }

  function fmt(dateStr) {
    if (!dateStr) return '';
    try { return new Date(dateStr).toLocaleDateString('en-IN', { year: 'numeric', month: 'short' }); }
    catch { return dateStr; }
  }

  return (
    <section id="section-certificates" className="admin-section active">
      <div className="section-header-admin">
        <h2>Manage Certificates</h2>
        <button className="btn btn-primary" id="addCertBtn" onClick={() => setModal({ cert: null })}>
          <i className="fas fa-plus" aria-hidden="true"></i> <span>Add Certificate</span>
        </button>
      </div>

      {loading ? (
        <p style={{ color: 'var(--color-text-secondary)' }}>Loading certificates...</p>
      ) : certs.length === 0 ? (
        <p style={{ textAlign: 'center', color: 'var(--color-text-secondary)' }}>No certificates added yet.</p>
      ) : (
        <div id="certificatesAdminList" style={{ display: 'grid', gap: '1rem' }}>
          {certs.map(c => (
            <div key={c.id} className="item-card">
              <div style={{ width: 52, height: 52, borderRadius: 8, background: 'rgba(0,212,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <i className="fas fa-certificate" style={{ fontSize: '1.5rem', color: 'var(--color-neon-blue)' }} aria-hidden="true"></i>
              </div>
              <div className="item-info" style={{ flex: 1, minWidth: 0 }}>
                <h3>{c.title}</h3>
                <p>
                  {c.issuer}
                  {c.duration && <> · {c.duration}</>}
                  {(c.from_date || c.to_date) && (
                    <> · {fmt(c.from_date)} – {fmt(c.to_date)}</>
                  )}
                </p>
                {c.file_path && (
                  <a href={c.file_path} target="_blank" rel="noopener noreferrer"
                    style={{ fontSize: '0.78rem', color: 'var(--color-neon-blue)' }}>
                    <i className="fas fa-file-pdf" aria-hidden="true"></i> View File
                  </a>
                )}
              </div>
              <div className="item-actions">
                <button className="btn-icon" id={`edit-cert-${c.id}`} title="Edit" onClick={() => setModal({ cert: c })}>
                  <i className="fas fa-edit" aria-hidden="true"></i>
                </button>
                <button className="btn-icon btn-danger" id={`delete-cert-${c.id}`} title="Delete" onClick={() => confirmDelete(c)}>
                  <i className="fas fa-trash" aria-hidden="true"></i>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && <CertModal cert={modal.cert} onClose={() => setModal(null)} onSave={handleSave} />}
      {confirm && <ConfirmModal title={confirm.title} message={confirm.message} type="danger"
        onConfirm={confirm.onConfirm} onCancel={() => setConfirm(null)} />}
    </section>
  );
}
