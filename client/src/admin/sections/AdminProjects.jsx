import { useState, useEffect } from 'react';
import {
  fetchProjects, fetchTechnologies, addProject, updateProject, deleteProject,
} from '../../utils/api';
import ConfirmModal from '../ConfirmModal';

const STATUS_OPTIONS = [
  { value: 'completed',   label: 'Completed' },
  { value: 'development', label: 'In Development' },
  { value: 'updating',    label: 'Updating' },
];

const TECH_CATEGORIES = ['database', 'language', 'frontend', 'backend'];
const TECH_ICONS = { database: 'fa-database', language: 'fa-code', frontend: 'fa-laptop-code', backend: 'fa-server' };
const TECH_COLORS = { database: '#00d4ff', language: '#a78bfa', frontend: '#f472b6', backend: '#22c55e' };

function parseTech(t) {
  if (!t) return [];
  if (Array.isArray(t)) return t;
  try { return JSON.parse(t); } catch { return t.split(',').map(s => s.trim()).filter(Boolean); }
}

function ProjectModal({ project, technologies, onClose, onSave }) {
  const initTech = parseTech(project?.technologies || project?.tech);
  const [form, setForm] = useState({
    title: project?.title || '',
    description: project?.description || '',
    status: project?.status || 'development',
    github: project?.github_url || '',
    demo: project?.demo_url || '',
  });
  const [selectedTech, setSelectedTech] = useState(initTech);
  const [imageFile, setImageFile] = useState(null);
  const [saving, setSaving] = useState(false);

  const grouped = TECH_CATEGORIES.reduce((acc, cat) => {
    acc[cat] = technologies.filter(t => t.category === cat);
    return acc;
  }, {});

  function toggleTech(name) {
    setSelectedTech(prev => prev.includes(name) ? prev.filter(t => t !== name) : [...prev, name]);
  }

  async function onSubmit(e) {
    e.preventDefault();
    setSaving(true);
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k === 'github' ? 'github_url' : k === 'demo' ? 'demo_url' : k, v));
    fd.append('technologies', selectedTech.join(','));
    if (imageFile) fd.append('image', imageFile);
    try { await onSave(fd); onClose(); }
    catch { } finally { setSaving(false); }
  }

  return (
    <div className="modal active" role="dialog" aria-modal="true" aria-labelledby="proj-modal-title"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-content card-3d" style={{ maxWidth: 760, maxHeight: '92vh', overflowY: 'auto' }}>
        <div className="modal-header">
          <h2 id="proj-modal-title">{project ? 'Edit Project' : 'Add Project'}</h2>
          <button className="modal-close" id="proj-modal-close" onClick={onClose} aria-label="Close">
            <i className="fas fa-times" aria-hidden="true"></i>
          </button>
        </div>
        <div className="modal-body">
          <form id="itemForm" className="admin-form" onSubmit={onSubmit}>
            <div className="form-group">
              <label htmlFor="proj-title">Title</label>
              <input id="proj-title" type="text" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label htmlFor="proj-desc">Description</label>
              <textarea id="proj-desc" rows={4} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} required />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="proj-status">Status</label>
                <select id="proj-status" value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
                  {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="proj-image">Project Image</label>
                <input id="proj-image" type="file" accept="image/*" onChange={e => setImageFile(e.target.files[0])} />
                {project?.image_path && <small style={{ color: 'var(--color-text-tertiary)' }}>Current: {project.image_path.split('/').pop()}</small>}
              </div>
            </div>

            {/* Technologies */}
            <div className="form-group">
              <label>Technologies Used</label>
              {/* Selected tags */}
              <div id="selectedTechTags" className="tech-tags-container" style={{ minHeight: 44, padding: '8px 12px', background: 'rgba(255,255,255,0.04)', borderRadius: 8, marginBottom: 12, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {selectedTech.length === 0
                  ? <span style={{ color: 'var(--color-text-tertiary)', fontSize: '0.85rem' }}>No technologies selected</span>
                  : selectedTech.map(t => (
                    <span key={t} className="tech-tag" data-tech={t}>
                      {t} <i className="fas fa-times" style={{ cursor: 'pointer', marginLeft: 4 }} onClick={() => toggleTech(t)} aria-label={`Remove ${t}`}></i>
                    </span>
                  ))
                }
              </div>

              {/* Tech buttons by category */}
              {TECH_CATEGORIES.map(cat => (
                <div key={cat} className="tech-category" style={{ marginBottom: '1rem' }}>
                  <h4 style={{ fontSize: '0.875rem', color: TECH_COLORS[cat], marginBottom: 8, textTransform: 'capitalize', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <i className={`fas ${TECH_ICONS[cat]}`} aria-hidden="true"></i> {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </h4>
                  <div className="tech-options">
                    {grouped[cat].map(tech => (
                      <button
                        key={tech.id}
                        type="button"
                        className={`tech-option-btn${selectedTech.includes(tech.name) ? ' selected' : ''}`}
                        data-tech={tech.name}
                        onClick={() => toggleTech(tech.name)}
                      >
                        {tech.icon_class && <i className={tech.icon_class} aria-hidden="true"></i>} {tech.name}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="proj-github">GitHub Link (optional)</label>
                <input id="proj-github" type="url" value={form.github} onChange={e => setForm(p => ({ ...p, github: e.target.value }))} placeholder="https://github.com/..." />
              </div>
              <div className="form-group">
                <label htmlFor="proj-demo">Demo Link (optional)</label>
                <input id="proj-demo" type="url" value={form.demo} onChange={e => setForm(p => ({ ...p, demo: e.target.value }))} placeholder="https://demo.example.com" />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" id="proj-save-btn" disabled={saving}>
              {saving ? <><i className="fas fa-spinner fa-spin" aria-hidden="true"></i> Saving...</> : <><i className="fas fa-save" aria-hidden="true"></i> Save Project</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function AdminProjects({ onNotify }) {
  const [projects, setProjects] = useState([]);
  const [technologies, setTechnologies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [confirm, setConfirm] = useState(null);

  async function load() {
    setLoading(true);
    try {
      const [p, t] = await Promise.all([fetchProjects(), fetchTechnologies()]);
      setProjects(p || []);
      setTechnologies(t || []);
    } catch { } finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  async function handleSave(fd) {
    try {
      let res;
      if (modal.project) res = await updateProject(modal.project.id, fd);
      else res = await addProject(fd);
      if (res.success) { onNotify(modal.project ? 'Project updated!' : 'Project added!'); await load(); }
      else onNotify('Operation failed.', 'error');
    } catch { onNotify('Error saving project.', 'error'); }
  }

  function confirmDelete(project) {
    setConfirm({
      title: 'Delete Project',
      message: `Delete "${project.title}"? This action cannot be undone.`,
      onConfirm: async () => {
        setConfirm(null);
        try {
          const res = await deleteProject(project.id);
          if (res.success) { onNotify('Project deleted!'); await load(); }
          else onNotify('Failed to delete.', 'error');
        } catch { onNotify('Error deleting project.', 'error'); }
      },
    });
  }

  const STATUS_BADGE = {
    completed: 'project-status status-completed',
    development: 'project-status status-development',
    updating: 'project-status status-updating',
  };

  return (
    <section id="section-projects" className="admin-section active">
      <div className="section-header-admin">
        <h2>Manage Projects</h2>
        <button className="btn btn-primary" id="addProjectBtn" onClick={() => setModal({ project: null })}>
          <i className="fas fa-plus" aria-hidden="true"></i> <span>Add Project</span>
        </button>
      </div>

      {loading ? (
        <p style={{ color: 'var(--color-text-secondary)' }}>Loading projects...</p>
      ) : projects.length === 0 ? (
        <p style={{ textAlign: 'center', color: 'var(--color-text-secondary)' }}>No projects added yet.</p>
      ) : (
        <div id="projectsList" style={{ display: 'grid', gap: '1rem' }}>
          {projects.map(p => {
            const techArray = parseTech(p.technologies || p.tech);
            return (
              <div key={p.id} className="item-card">
                {p.image_path && (
                  <img src={p.image_path} alt={p.title} style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 8, flexShrink: 0 }} />
                )}
                <div className="item-info" style={{ flex: 1, minWidth: 0 }}>
                  <h3>{p.title}</h3>
                  <p style={{ marginBottom: '0.5rem' }}>{p.description?.substring(0, 100)}{p.description?.length > 100 ? '…' : ''}</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
                    <span className={STATUS_BADGE[p.status] || STATUS_BADGE.development}>
                      {STATUS_OPTIONS.find(s => s.value === p.status)?.label || p.status}
                    </span>
                    {techArray.slice(0, 4).map((t, i) => (
                      <span key={i} className="tech-tag" style={{ fontSize: '0.7rem' }}>{typeof t === 'string' ? t : t.name}</span>
                    ))}
                    {techArray.length > 4 && <span style={{ color: 'var(--color-text-tertiary)', fontSize: '0.75rem' }}>+{techArray.length - 4}</span>}
                  </div>
                </div>
                <div className="item-actions">
                  <button className="btn-icon" id={`edit-proj-${p.id}`} title="Edit" onClick={() => setModal({ project: p })}>
                    <i className="fas fa-edit" aria-hidden="true"></i>
                  </button>
                  <button className="btn-icon btn-danger" id={`delete-proj-${p.id}`} title="Delete" onClick={() => confirmDelete(p)}>
                    <i className="fas fa-trash" aria-hidden="true"></i>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {modal && (
        <ProjectModal
          project={modal.project}
          technologies={technologies}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}
      {confirm && (
        <ConfirmModal title={confirm.title} message={confirm.message} type="danger"
          onConfirm={confirm.onConfirm} onCancel={() => setConfirm(null)} />
      )}
    </section>
  );
}
