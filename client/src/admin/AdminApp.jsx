import { useState, useEffect, useCallback } from 'react';
import { checkAuth, logout } from '../utils/api';

import AdminLogin from './AdminLogin';
import AdminLayout from './AdminLayout';
import AdminDashboard from './sections/AdminDashboard';
import AdminProfile from './sections/AdminProfile';
import AdminSkills from './sections/AdminSkills';
import AdminProjects from './sections/AdminProjects';
import AdminCertificates from './sections/AdminCertificates';
import AdminMessages from './sections/AdminMessages';
import AdminResume from './sections/AdminResume';

// ── Notification Toast ─────────────────────────────────────
function Notification({ notifications }) {
  return (
    <div id="notifications" style={{
      position: 'fixed', bottom: '1.5rem', right: '1.5rem',
      zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '0.75rem',
      pointerEvents: 'none',
    }}>
      {notifications.map(n => (
        <div
          key={n.id}
          className={`admin-notification${n.type === 'error' ? ' notification-error' : ''}`}
          style={{ pointerEvents: 'all' }}
        >
          <i className={`fas ${n.type === 'error' ? 'fa-times-circle' : 'fa-check-circle'}`} aria-hidden="true"></i>
          {n.message}
        </div>
      ))}
    </div>
  );
}

// ── Main Admin App ─────────────────────────────────────────
export default function AdminApp() {
  const [authenticated, setAuthenticated] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [messageCount, setMessageCount] = useState(0);
  const [notifications, setNotifications] = useState([]);

  // Check auth on mount
  useEffect(() => {
    checkAuth().then(ok => {
      setAuthenticated(ok);
      setAuthChecked(true);
    });
  }, []);

  // Notification helper
  const notify = useCallback((message, type = 'success') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 3500);
  }, []);

  async function handleLogout() {
    await logout();
    setAuthenticated(false);
    setActiveSection('dashboard');
  }

  // Loading spinner while checking session
  if (!authChecked) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center',
        justifyContent: 'center', background: 'var(--color-bg-primary)',
      }}>
        <i className="fas fa-spinner fa-spin" style={{ fontSize: '2rem', color: 'var(--color-neon-blue)' }} aria-hidden="true"></i>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <>
        <AdminLogin onLogin={() => setAuthenticated(true)} />
        <Notification notifications={notifications} />
      </>
    );
  }

  // Section renderer
  const sectionProps = { onNotify: notify };

  function renderSection() {
    switch (activeSection) {
      case 'dashboard':    return <AdminDashboard {...sectionProps} />;
      case 'profile':      return <AdminProfile {...sectionProps} />;
      case 'skills':       return <AdminSkills {...sectionProps} />;
      case 'projects':     return <AdminProjects {...sectionProps} />;
      case 'certificates': return <AdminCertificates {...sectionProps} />;
      case 'messages':     return <AdminMessages {...sectionProps} onMessageCountChange={setMessageCount} />;
      case 'resume':       return <AdminResume {...sectionProps} />;
      default:             return <AdminDashboard {...sectionProps} />;
    }
  }

  return (
    <>
      <AdminLayout
        activeSection={activeSection}
        onNavigate={setActiveSection}
        onLogout={handleLogout}
        messageCount={messageCount}
      >
        {renderSection()}
      </AdminLayout>
      <Notification notifications={notifications} />
    </>
  );
}
