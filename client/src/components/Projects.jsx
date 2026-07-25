import { useState, useMemo } from 'react';

function parseTech(technologies) {
  if (!technologies) return [];
  if (Array.isArray(technologies)) return technologies;
  if (typeof technologies === 'string') {
    try { return JSON.parse(technologies); } catch { return technologies.split(',').map(t => t.trim()).filter(Boolean); }
  }
  return [];
}

function StatusBadge({ status }) {
  const map = {
    completed: { cls: 'status-completed', label: '✓ Completed' },
    development: { cls: 'status-development', label: '⚡ In Development' },
    updating: { cls: 'status-updating', label: '🔄 Updating' },
  };
  const { cls, label } = map[status] || map.development;
  return <span className={`project-status ${cls}`}>{label}</span>;
}

function TechTag({ name, iconClass }) {
  return (
    <span className="tech-tag-icon" title={name}>
      {iconClass ? <i className={iconClass} aria-hidden="true"></i> : null}
      {name}
    </span>
  );
}

function ProjectCard({ project, techMap }) {
  const techArray = parseTech(project.technologies || project.tech);

  const githubUrl = project.github_url || project.github || null;
  const demoUrl = project.demo_url || project.live_url || null;
  const status = project.status || 'development';
  const imageUrl = project.image_path || project.image || null;

  return (
    <article className="project-card" data-aos="fade-up" aria-label={project.title}>
      <div className="project-image">
        {imageUrl ? (
          <img src={imageUrl} alt={`${project.title} screenshot`} loading="lazy" />
        ) : (
          <div style={{
            width: '100%', height: '100%',
            background: 'linear-gradient(135deg, rgba(0,212,255,0.15), rgba(168,85,247,0.15))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '4rem',
          }}>
            💼
          </div>
        )}
        <StatusBadge status={status} />
      </div>

      <div className="project-content">
        <h3 className="project-title">{project.title}</h3>
        {project.description && (
          <p className="project-description">{project.description}</p>
        )}

        {/* Tech Tags */}
        {techArray.length > 0 && (
          <div className="project-tech">
            {techArray.map((tech, i) => {
              const name = typeof tech === 'string' ? tech : tech.name;
              const iconClass = techMap[name] || techMap[name?.toLowerCase()] || null;
              return <TechTag key={i} name={name} iconClass={iconClass} />;
            })}
          </div>
        )}

        {/* Links */}
        <div className="project-links">
          {githubUrl ? (
            <a
              href={githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="project-link project-link-active"
              aria-label={`${project.title} GitHub repository`}
            >
              <i className="fab fa-github" aria-hidden="true"></i> GitHub
            </a>
          ) : (
            <span className="project-link project-link-disabled" aria-label="GitHub not available">
              <i className="fab fa-github" aria-hidden="true"></i> GitHub
              <span className="link-status">Private</span>
            </span>
          )}

          {demoUrl ? (
            <a
              href={demoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="project-link project-link-active"
              aria-label={`${project.title} live demo`}
            >
              <i className="fas fa-external-link-alt" aria-hidden="true"></i> Live Demo
            </a>
          ) : (
            <span className="project-link project-link-disabled" aria-label="Demo not available">
              <i className="fas fa-external-link-alt" aria-hidden="true"></i> Demo
              <span className="link-status">Soon</span>
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

const FILTERS = [
  { value: 'all', label: 'All Projects' },
  { value: 'completed', label: '✓ Completed' },
  { value: 'development', label: '⚡ In Development' },
];

export default function Projects({ projects, technologies }) {
  const [activeFilter, setActiveFilter] = useState('all');

  // Build tech icon map
  const techMap = useMemo(() => {
    const map = {};
    (technologies || []).forEach(t => {
      map[t.name] = t.icon_class || null;
      map[t.name?.toLowerCase()] = t.icon_class || null;
    });
    return map;
  }, [technologies]);

  const filtered = useMemo(() => {
    if (!projects) return [];
    if (activeFilter === 'all') return projects;
    return projects.filter(p => (p.status || 'development') === activeFilter);
  }, [projects, activeFilter]);

  if (!projects || projects.length === 0) return null;

  return (
    <section id="projects" aria-labelledby="projects-heading">
      <div className="container">
        <div className="section-header" data-aos="fade-up">
          <span className="section-label">What I&apos;ve Built</span>
          <h2 id="projects-heading" className="section-title">My <span className="text-gradient">Projects</span></h2>
          <div className="section-divider"></div>
        </div>

        {/* Filter Buttons */}
        <div className="projects-filter" role="tablist" aria-label="Filter projects">
          {FILTERS.map(({ value, label }) => (
            <button
              key={value}
              className={`filter-btn${activeFilter === value ? ' active' : ''}`}
              role="tab"
              aria-selected={activeFilter === value}
              id={`filter-${value}`}
              onClick={() => setActiveFilter(value)}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Projects Grid */}
        <div className="projects-grid" id="projectsGrid" role="tabpanel">
          {filtered.length > 0 ? (
            filtered.map(project => (
              <ProjectCard key={project.id} project={project} techMap={techMap} />
            ))
          ) : (
            <p style={{ gridColumn: '1/-1', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
              No projects in this category yet.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
