// ===================================
// Skills - Infinite scroll marquee
// Port of loadSkills() from app.js
// ===================================

function ensureMinItems(arr, min = 8) {
  let result = [...arr];
  while (result.length < min) result = [...result, ...result];
  return result;
}

function duplicateItems(arr, times = 10) {
  const out = [];
  for (let i = 0; i < times; i++) out.push(...arr);
  return out;
}

function SkillItem({ skill, techMap }) {
  const iconClass = skill.icon_class || skill.icon || techMap[skill.name?.toLowerCase()] || 'fas fa-code';
  return (
    <div className="skill-scroll-item" title={skill.name}>
      <i className={`${iconClass} colored`} aria-hidden="true"></i>
      <span>{skill.name}</span>
    </div>
  );
}

export default function Skills({ skills, technologies }) {
  if (!skills || skills.length === 0) return null;

  // Build tech icon lookup map
  const techMap = {};
  (technologies || []).forEach(t => {
    techMap[t.name?.toLowerCase()] = t.icon_class || 'fas fa-code';
  });

  // Split all skills alternately into 2 rows
  const row1Skills = skills.filter((_, i) => i % 2 === 0);
  const row2Skills = skills.filter((_, i) => i % 2 !== 0);

  const row1 = duplicateItems(ensureMinItems(row1Skills));
  const row2 = duplicateItems(ensureMinItems(row2Skills.length > 0 ? row2Skills : row1Skills));

  return (
    <section id="skills" aria-labelledby="skills-heading">
      <div className="container">
        <div className="section-header" data-aos="fade-up">
          <span className="section-label">What I Know</span>
          <h2 id="skills-heading" className="section-title">Technical <span className="text-gradient">Skills</span></h2>
          <div className="section-divider"></div>
        </div>
      </div>

      {/* Infinite scroll rows — outside container for full width */}
      <div className="skills-infinite-scroll" id="skillsContainer" aria-label="Skills marquee">
        {/* Row 1: Right to Left */}
        <div className="scroll-row-wrapper">
          <div className="scroll-row scroll-row-1" aria-hidden="true">
            {row1.map((skill, i) => (
              <SkillItem key={`r1-${i}`} skill={skill} techMap={techMap} />
            ))}
          </div>
        </div>

        {/* Row 2: Left to Right */}
        <div className="scroll-row-wrapper">
          <div className="scroll-row scroll-row-2" aria-hidden="true">
            {row2.map((skill, i) => (
              <SkillItem key={`r2-${i}`} skill={skill} techMap={techMap} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
