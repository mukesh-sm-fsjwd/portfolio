import { useState, useEffect, useRef } from 'react';
import { fetchProfile, uploadResume, deleteResume } from '../../utils/api';
import ConfirmModal from '../ConfirmModal';

export default function AdminResume({ onNotify }) {
  const [resumePath, setResumePath] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [confirm, setConfirm] = useState(null);
  const fileRef = useRef(null);

  async function load() {
    setLoading(true);
    try {
      const profile = await fetchProfile();
      setResumePath(profile?.resume_path || null);
    } catch { } finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  async function handleUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      onNotify('Only PDF files are allowed.', 'error');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      onNotify('File must be under 5 MB.', 'error');
      return;
    }

    setUploading(true);
    const fd = new FormData();
    fd.append('resume', file);
    try {
      const data = await uploadResume(fd);
      if (data.success) {
        onNotify('Resume uploaded successfully!');
        await load();
      } else {
        onNotify(data.message || 'Upload failed.', 'error');
      }
    } catch { onNotify('Error uploading resume.', 'error'); }
    finally { setUploading(false); }
  }

  function confirmDelete() {
    setConfirm({
      title: 'Delete Resume',
      message: 'Your resume will be permanently deleted. This action cannot be undone.',
      onConfirm: async () => {
        setConfirm(null);
        try {
          const data = await deleteResume();
          if (data.success) {
            onNotify('Resume deleted.');
            setResumePath(null);
          } else {
            onNotify('Failed to delete.', 'error');
          }
        } catch { onNotify('Error deleting resume.', 'error'); }
      },
    });
  }

  const filename = resumePath ? resumePath.split('/').pop() : null;

  return (
    <section id="section-resume" className="admin-section active">
      <div className="section-header-admin">
        <h2>Manage Resume</h2>
      </div>

      {loading ? (
        <p style={{ color: 'var(--color-text-secondary)' }}>Loading...</p>
      ) : resumePath ? (
        /* Resume exists */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Preview card */}
          <div className="item-card" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', width: '100%' }}>
              <div style={{
                width: 54, height: 54, borderRadius: '0.75rem', flexShrink: 0,
                background: 'linear-gradient(135deg, rgba(0,212,255,0.2), rgba(168,85,247,0.2))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <i className="fas fa-file-pdf" style={{ fontSize: '1.6rem', color: '#ef4444' }} aria-hidden="true"></i>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{filename}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-tertiary)', marginTop: '0.2rem' }}>
                  <i className="fas fa-check-circle" style={{ color: '#22c55e', marginRight: 5 }} aria-hidden="true"></i>
                  Resume is live on your portfolio
                </div>
              </div>
            </div>

            {/* PDF inline preview */}
            <div style={{ width: '100%', height: 480, borderRadius: '0.5rem', overflow: 'hidden', background: '#0a0a0f', border: '1px solid rgba(255,255,255,0.07)' }}>
              <iframe
                src={`${resumePath}#toolbar=0&navpanes=0`}
                title="Resume preview"
                style={{ width: '100%', height: '100%', border: 'none' }}
              />
            </div>

            <div id="resume-actions" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <a href={resumePath} target="_blank" rel="noopener noreferrer" className="btn btn-primary" id="resume-view-btn">
                <i className="fas fa-eye" aria-hidden="true"></i> View
              </a>
              <a href={resumePath} download className="btn btn-secondary" id="resume-download-btn">
                <i className="fas fa-download" aria-hidden="true"></i> Download
              </a>
              <button className="btn btn-danger" id="resume-delete-btn" onClick={confirmDelete}>
                <i className="fas fa-trash" aria-hidden="true"></i> Delete
              </button>
            </div>
          </div>

          {/* Replace */}
          <div style={{ padding: '1.25rem', borderRadius: '0.75rem', background: 'rgba(255,255,255,0.03)', border: '1px dashed rgba(255,255,255,0.12)' }}>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', marginBottom: '0.75rem' }}>
              <i className="fas fa-info-circle" style={{ color: 'var(--color-neon-blue)', marginRight: 6 }} aria-hidden="true"></i>
              Want to replace your resume? Upload a new PDF below.
            </p>
            <input type="file" accept="application/pdf" ref={fileRef} onChange={handleUpload} style={{ display: 'none' }} id="resumeInput" />
            <button className="btn btn-outline" id="resume-replace-btn" disabled={uploading} onClick={() => fileRef.current?.click()}>
              {uploading
                ? <><i className="fas fa-spinner fa-spin" aria-hidden="true"></i> Uploading...</>
                : <><i className="fas fa-upload" aria-hidden="true"></i> Replace Resume</>
              }
            </button>
          </div>
        </div>
      ) : (
        /* No resume */
        <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <i className="fas fa-file-pdf" style={{ fontSize: '4rem', color: 'rgba(255,255,255,0.15)' }} aria-hidden="true"></i>
          </div>
          <h3 style={{ color: 'var(--color-text-secondary)', marginBottom: '0.5rem' }}>No Resume Uploaded</h3>
          <p style={{ color: 'var(--color-text-tertiary)', marginBottom: '2rem', fontSize: '0.9rem' }}>
            Upload a PDF file (max 5 MB) to make your resume available on the portfolio.
          </p>
          <input type="file" accept="application/pdf" ref={fileRef} onChange={handleUpload} style={{ display: 'none' }} id="resumeInputEmpty" />
          <button className="btn btn-primary" id="resume-upload-btn" disabled={uploading} onClick={() => fileRef.current?.click()}>
            {uploading
              ? <><i className="fas fa-spinner fa-spin" aria-hidden="true"></i> Uploading...</>
              : <><i className="fas fa-upload" aria-hidden="true"></i> Upload Resume PDF</>
            }
          </button>
        </div>
      )}

      {confirm && (
        <ConfirmModal
          title={confirm.title}
          message={confirm.message}
          type="danger"
          onConfirm={confirm.onConfirm}
          onCancel={() => setConfirm(null)}
        />
      )}
    </section>
  );
}
