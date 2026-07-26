// ===================================
// Admin Sidebar + Header layout wrapper
// ===================================

const NAV_ITEMS = [
  { id: 'dashboard', icon: 'fa-chart-line', label: 'Dashboard' },
  { id: 'profile', icon: 'fa-user', label: 'Profile' },
  { id: 'skills', icon: 'fa-code', label: 'Skills' },
  { id: 'projects', icon: 'fa-folder', label: 'Projects' },
  { id: 'certificates', icon: 'fa-certificate', label: 'Certificates' },
  { id: 'messages', icon: 'fa-envelope', label: 'Messages' },
  { id: 'resume', icon: 'fa-file-pdf', label: 'Resume' },
];

export default function AdminLayout({ activeSection, onNavigate, onLogout, messageCount, children }) {
  return (
    <div className="admin-dashboard" id="adminDashboard" style={{ display: 'grid' }}>
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <span className="logo-bracket">&lt;</span>
            <span className="logo-text">Admin</span>
            <span className="logo-bracket">/&gt;</span>
          </div>
        </div>

        <nav className="sidebar-nav" role="navigation" aria-label="Admin navigation">
          {NAV_ITEMS.map(({ id, icon, label }) => (
            <a
              key={id}
              href={`#${id}`}
              className={`nav-item${activeSection === id ? ' active' : ''}`}
              id={`nav-${id}`}
              aria-current={activeSection === id ? 'page' : undefined}
              onClick={(e) => { e.preventDefault(); onNavigate(id); }}
            >
              <i className={`fas ${icon}`} aria-hidden="true"></i>
              <span>{label}</span>
              {id === 'messages' && messageCount > 0 && (
                <span className="badge" id="messageCount">{messageCount}</span>
              )}
            </a>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button
            className="btn btn-outline btn-block"
            id="logoutBtn"
            onClick={onLogout}
          >
            <i className="fas fa-sign-out-alt" aria-hidden="true"></i>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="admin-main">
        <header className="admin-header">
          <div className="header-left">
            <h1 id="sectionTitle">
              {NAV_ITEMS.find(n => n.id === activeSection)?.label || 'Dashboard'}
            </h1>
          </div>
          <div className="header-right">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
              id="view-portfolio-btn"
            >
              <i className="fas fa-eye" aria-hidden="true"></i>
              <span>View Portfolio</span>
            </a>
          </div>
        </header>

        <div className="admin-content">
          {children}
        </div>
      </main>
    </div>
  );
}
