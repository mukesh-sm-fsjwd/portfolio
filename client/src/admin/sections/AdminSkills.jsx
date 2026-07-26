import { useState, useEffect } from 'react';
import { fetchSkills, addSkill, updateSkill, deleteSkill } from '../../utils/api';
import ConfirmModal from '../ConfirmModal';

const SKILL_LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];
const CATEGORY_ICONS = {
  Backend: 'fas fa-server', Frontend: 'fas fa-palette', Database: 'fas fa-database',
  Tools: 'fas fa-tools', Mobile: 'fas fa-mobile-alt', Cloud: 'fas fa-cloud', DevOps: 'fas fa-cogs',
};

function SkillModal({ skill, onClose, onSave }) {
  const [form, setForm] = useState({
    name: skill?.name || '', category: skill?.category || '', level: skill?.level || 'Intermediate',
    icon_class: skill?.icon_class || skill?.icon || '',
  });
  const [saving, setSaving] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try { await onSave(form); onClose(); }
    catch { } finally { setSaving(false); }
  }

  return (
    <div className="modal active" role="dialog" aria-modal="true" aria-labelledby="skill-modal-title"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-content card-3d">
        <div className="modal-header">
          <h2 id="skill-modal-title">{skill ? 'Edit Skill' : 'Add Skill'}</h2>
          <button className="modal-close" id="skill-modal-close" onClick={onClose} aria-label="Close">
            <i className="fas fa-times" aria-hidden="true"></i>
          </button>
        </div>
        <div className="modal-body">
          <form id="skillForm" className="admin-form" onSubmit={onSubmit}>
            <div className="form-group">
              <label htmlFor="skill-name">Skill Name</label>
              <input id="skill-name" type="text" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required placeholder="e.g., Spring Boot" />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="skill-category">Category</label>
                <input id="skill-category" type="text" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} required placeholder="e.g., Backend" list="categories-list" />
                <datalist id="categories-list">
                  {Object.keys(CATEGORY_ICONS).map(c => <option key={c} value={c} />)}
                </datalist>
              </div>
              <div className="form-group">
                <label htmlFor="skill-level">Level</label>
                <select id="skill-level" value={form.level} onChange={e => setForm(p => ({ ...p, level: e.target.value }))}>
                  {SKILL_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="skill-icon">Icon Class (devicon / Font Awesome)</label>
              <input id="skill-icon" type="text" value={form.icon_class} onChange={e => setForm(p => ({ ...p, icon_class: e.target.value }))} placeholder="e.g., devicon-spring-plain colored" />
              {form.icon_class && (
                <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <i className={form.icon_class} style={{ fontSize: '2rem' }} aria-hidden="true"></i>
                  <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>Preview</span>
                </div>
              )}
            </div>
            <button type="submit" className="btn btn-primary" id="skill-save-btn" disabled={saving}>
              {saving ? <><i className="fas fa-spinner fa-spin" aria-hidden="true"></i> Saving...</> : <><i className="fas fa-save" aria-hidden="true"></i> Save Skill</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function AdminSkills({ onNotify }) {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | { skill: obj | null }
  const [confirm, setConfirm] = useState(null);

  async function load() {
    setLoading(true);
    try { setSkills(await fetchSkills() || []); }
    catch { } finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  // Group skills by category
  const grouped = skills.reduce((acc, sk) => {
    const cat = sk.category || 'Other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(sk);
    return acc;
  }, {});

  async function handleSave(form) {
    try {
      let res;
      if (modal.skill) res = await updateSkill(modal.skill.id, form);
      else res = await addSkill(form);
      if (res.success) { onNotify(modal.skill ? 'Skill updated!' : 'Skill added!'); await load(); }
      else onNotify('Operation failed.', 'error');
    } catch { onNotify('Error saving skill.', 'error'); }
  }

  function confirmDelete(skill) {
    setConfirm({
      title: 'Delete Skill',
      message: `Are you sure you want to delete "${skill.name}"? This cannot be undone.`,
      onConfirm: async () => {
        setConfirm(null);
        try {
          const res = await deleteSkill(skill.id);
          if (res.success) { onNotify('Skill deleted!'); await load(); }
          else onNotify('Failed to delete skill.', 'error');
        } catch { onNotify('Error deleting skill.', 'error'); }
      },
    });
  }

  return (
    <section id="section-skills" className="admin-section active">
      <div className="section-header-admin">
        <h2>Manage Skills</h2>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn btn-primary" id="addSkillBtn" onClick={() => setModal({ skill: null })}>
            <i className="fas fa-plus" aria-hidden="true"></i> <span>Add Skill</span>
          </button>
        </div>
      </div>

      {loading ? (
        <p style={{ color: 'var(--color-text-secondary)' }}>Loading skills...</p>
      ) : Object.keys(grouped).length === 0 ? (
        <p style={{ textAlign: 'center', color: 'var(--color-text-secondary)' }}>No skills added yet.</p>
      ) : (
        Object.entries(grouped).map(([category, catSkills]) => (
          <div key={category} className="category-group" style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h3 style={{ color: 'var(--color-neon-blue)', fontSize: '1.2rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <i className={CATEGORY_ICONS[category] || 'fas fa-folder'} aria-hidden="true"></i> {category}
              </h3>
            </div>
            <div id="skillsList" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px,1fr))', gap: '1rem' }}>
              {catSkills.map(skill => (
                <div key={skill.id} className="item-card">
                  <div className="item-info" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <i className={skill.icon_class || skill.icon || 'fas fa-code'} style={{ fontSize: '1.5rem', color: 'var(--color-neon-blue)' }} aria-hidden="true"></i>
                    <div>
                      <h3>{skill.name}</h3>
                      {skill.level && <p>{skill.level}</p>}
                    </div>
                  </div>
                  <div className="item-actions">
                    <button
                      className="btn-icon"
                      id={`edit-skill-${skill.id}`}
                      title="Edit skill"
                      onClick={() => setModal({ skill })}
                    >
                      <i className="fas fa-edit" aria-hidden="true"></i>
                    </button>
                    <button
                      className="btn-icon btn-danger"
                      id={`delete-skill-${skill.id}`}
                      title="Delete skill"
                      onClick={() => confirmDelete(skill)}
                    >
                      <i className="fas fa-trash" aria-hidden="true"></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}

      {modal && <SkillModal skill={modal.skill} onClose={() => setModal(null)} onSave={handleSave} />}
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
