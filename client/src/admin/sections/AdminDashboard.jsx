import { useState, useEffect, useRef } from 'react';
import { fetchDashboardStats, fetchActivity, fetchVisitors } from '../../utils/api';

const ACTION_META = {
  LOGIN_SUCCESS: { icon: 'fa-sign-in-alt', color: '#22c55e', bg: 'rgba(34,197,94,0.12)' },
  LOGIN_FAILED: { icon: 'fa-times-circle', color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
  LOGOUT: { icon: 'fa-sign-out-alt', color: '#94a3b8', bg: 'rgba(148,163,184,0.1)' },
  PROFILE_UPDATE: { icon: 'fa-user-edit', color: '#00d4ff', bg: 'rgba(0,212,255,0.1)' },
  SKILL_ADD: { icon: 'fa-plus-circle', color: '#00d4ff', bg: 'rgba(0,212,255,0.1)' },
  SKILL_UPDATE: { icon: 'fa-edit', color: '#a78bfa', bg: 'rgba(167,139,250,0.1)' },
  SKILL_DELETE: { icon: 'fa-trash', color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
  PROJECT_ADD: { icon: 'fa-folder-plus', color: '#00d4ff', bg: 'rgba(0,212,255,0.1)' },
  PROJECT_UPDATE: { icon: 'fa-edit', color: '#a78bfa', bg: 'rgba(167,139,250,0.1)' },
  PROJECT_DELETE: { icon: 'fa-trash', color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
  CERTIFICATE_ADD: { icon: 'fa-certificate', color: '#00d4ff', bg: 'rgba(0,212,255,0.1)' },
  CERTIFICATE_UPDATE: { icon: 'fa-edit', color: '#a78bfa', bg: 'rgba(167,139,250,0.1)' },
  CERTIFICATE_DELETE: { icon: 'fa-trash', color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
  RESUME_UPLOAD: { icon: 'fa-file-upload', color: '#22c55e', bg: 'rgba(34,197,94,0.12)' },
  RESUME_DELETE: { icon: 'fa-file-excel', color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
};

const BROWSER_ICONS = { Chrome: 'fa-chrome', Firefox: 'fa-firefox', Safari: 'fa-safari', Edge: 'fa-edge', Opera: 'fa-opera' };

function AnimatedNumber({ value }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!value) return;
    let start = 0;
    const duration = 1000;
    const step = value / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= value) { setDisplay(value); clearInterval(timer); }
      else setDisplay(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [value]);

  return <>{display}</>;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState({});
  const [activities, setActivities] = useState([]);
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const pollRef = useRef(null);

  async function loadAll() {
    setLoading(true);
    try {
      const [s, a, v] = await Promise.all([fetchDashboardStats(), fetchActivity(), fetchVisitors()]);
      setStats(s || {});
      setActivities(a || []);
      setVisitors(v || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  async function refreshVisitors() {
    setRefreshing(true);
    try { const v = await fetchVisitors(); setVisitors(v || []); } catch { }
    finally { setTimeout(() => setRefreshing(false), 600); }
  }

  useEffect(() => {
    loadAll();
    pollRef.current = setInterval(refreshVisitors, 30000);
    return () => clearInterval(pollRef.current);
  }, []);

  function fmt(dateStr) {
    try { return new Date(dateStr).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }); } catch { return ''; }
  }

  function fmtDuration(s) {
    if (!s) return '—';
    return s < 60 ? `${s}s` : `${Math.floor(s / 60)}m ${s % 60}s`;
  }

  return (
    <section id="section-dashboard" className="admin-section active">
      {/* Stat Cards */}
      <div className="stats-grid">
        {[
          { id: 'totalProjects', icon: 'fa-folder', val: stats.total_projects, label: 'Total Projects' },
          { id: 'totalCertificates', icon: 'fa-certificate', val: stats.total_certificates, label: 'Certificates' },
          { id: 'totalMessages', icon: 'fa-envelope', val: stats.total_messages, label: 'Messages' },
          { id: 'totalSkills', icon: 'fa-code', val: stats.total_skills, label: 'Skills' },
        ].map(({ id, icon, val, label }) => (
          <div key={id} className="stat-card card-3d">
            <div className="stat-icon"><i className={`fas ${icon}`} aria-hidden="true"></i></div>
            <div className="stat-info">
              <h3 id={id}><AnimatedNumber value={val || 0} /></h3>
              <p>{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Widgets */}
      <div className="dashboard-widgets" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '1.5rem' }}>
        {/* Activity */}
        <div className="widget card-3d">
          <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <i className="fas fa-history" style={{ color: 'var(--color-neon-blue)' }} aria-hidden="true"></i> Recent Activity
          </h3>
          <div id="activityList" className="dash-scroll-panel">
            {loading ? (
              <p style={{ color: 'var(--color-text-tertiary)', textAlign: 'center', padding: '2rem' }}>Loading...</p>
            ) : activities.length === 0 ? (
              <p style={{ color: 'var(--color-text-tertiary)', textAlign: 'center', padding: '2rem' }}>No activity yet</p>
            ) : (
              activities.map((a, i) => {
                const meta = ACTION_META[a.action] || { icon: 'fa-circle', color: '#94a3b8', bg: 'rgba(148,163,184,0.1)' };
                return (
                  <div key={i} className="dash-activity-item" style={{ animationDelay: `${i * 40}ms` }}>
                    <div className="dash-icon-circle" style={{ background: meta.bg, animationDelay: `${i * 300}ms` }}>
                      <i className={`fas ${meta.icon}`} style={{ color: meta.color, fontSize: '0.72rem' }} aria-hidden="true"></i>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.82rem', color: 'var(--color-text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {a.details || a.action}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--color-text-tertiary)', marginTop: '0.15rem' }}>{fmt(a.created_at)}</div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Visitors */}
        <div className="widget card-3d">
          <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <i className="fas fa-eye" style={{ color: 'var(--color-neon-purple)' }} aria-hidden="true"></i> Portfolio Visitors
            <span id="visitorCount" style={{ background: 'rgba(139,92,246,0.2)', color: 'var(--color-neon-purple)', borderRadius: '1rem', padding: '0.1rem 0.6rem', fontSize: '0.75rem' }}>
              {visitors.length}
            </span>
            <i
              id="visitorRefreshIcon"
              className={`fas fa-sync${refreshing ? ' visitor-refresh-spin' : ''}`}
              style={{ marginLeft: 'auto', fontSize: '0.72rem', color: 'var(--color-text-tertiary)', cursor: 'pointer' }}
              title="Auto-refreshes every 30s"
              onClick={refreshVisitors}
              aria-label="Refresh visitors"
            ></i>
          </h3>
          <div id="visitorsList" className="dash-scroll-panel">
            {loading ? (
              <p style={{ color: 'var(--color-text-tertiary)', textAlign: 'center', padding: '2rem' }}>Loading...</p>
            ) : visitors.length === 0 ? (
              <p style={{ color: 'var(--color-text-tertiary)', textAlign: 'center', padding: '2rem' }}>No visitors yet</p>
            ) : (
              visitors.map((v, i) => {
                const bIcon = BROWSER_ICONS[v.browser] || 'fa-globe';
                return (
                  <div key={i} className="dash-visitor-item" style={{ animationDelay: `${i * 40}ms` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                      <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(139,92,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <i className={`fab ${bIcon}`} style={{ color: 'var(--color-neon-purple)', fontSize: '0.8rem' }} aria-hidden="true"></i>
                      </div>
                      <span style={{ fontSize: '0.82rem', color: 'var(--color-text-primary)', fontWeight: 500 }}>{v.browser} · {v.os}</span>
                      <span style={{ marginLeft: 'auto', fontSize: '0.7rem', background: 'rgba(139,92,246,0.15)', color: 'var(--color-neon-purple)', padding: '0.15rem 0.55rem', borderRadius: '1rem', whiteSpace: 'nowrap' }}>
                        <i className="fas fa-clock" aria-hidden="true" style={{ marginRight: 3 }}></i> {fmtDuration(v.time_spent_seconds)}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--color-text-tertiary)', display: 'flex', gap: '1.2rem', paddingLeft: 36 }}>
                      <span><i className="fas fa-desktop" style={{ marginRight: 3 }} aria-hidden="true"></i>{v.screen_size}</span>
                      <span><i className="fas fa-clock" style={{ marginRight: 3 }} aria-hidden="true"></i>{fmt(v.visited_at)}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
