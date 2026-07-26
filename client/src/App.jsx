import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Skills from './components/Skills';
import Projects from './components/Projects';
import Certificates from './components/Certificates';
import Contact from './components/Contact';
import Footer from './components/Footer';
import { useAOS } from './hooks/useAOS';
import {
  fetchProfile,
  fetchSkills,
  fetchProjects,
  fetchCertificates,
  fetchTechnologies,
} from './utils/api';
import { initVisitorTracking } from './utils/visitorTracking';

export default function App() {
  const [profile, setProfile]           = useState(null);
  const [skills, setSkills]             = useState([]);
  const [projects, setProjects]         = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [technologies, setTechnologies] = useState([]);
  const [loaded, setLoaded]             = useState(false);

  useAOS('-80px');

  // Visitor tracking — non-blocking, ignore errors
  useEffect(() => { initVisitorTracking(); }, []);

  // Fetch every section independently using Promise.allSettled
  // One failing API (e.g. missing table) won't block other sections
  useEffect(() => {
    let mounted = true;

    async function loadAll() {
      const results = await Promise.allSettled([
        fetchProfile(),
        fetchSkills(),
        fetchProjects(),
        fetchCertificates(),
        fetchTechnologies(),
      ]);

      if (!mounted) return;

      const [profileRes, skillsRes, projectsRes, certsRes, techRes] = results;

      if (profileRes.status  === 'fulfilled') setProfile(profileRes.value);
      if (skillsRes.status   === 'fulfilled') setSkills(skillsRes.value   || []);
      if (projectsRes.status === 'fulfilled') setProjects(projectsRes.value || []);
      if (certsRes.status    === 'fulfilled') setCertificates(certsRes.value || []);
      if (techRes.status     === 'fulfilled') setTechnologies(techRes.value  || []);

      setLoaded(true);
    }

    loadAll();
    return () => { mounted = false; };
  }, []);

  // Re-trigger AOS for elements already in viewport once data arrives
  useEffect(() => {
    if (!loaded) return;
    const timer = setTimeout(() => {
      document.querySelectorAll('[data-aos]').forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight) {
          el.classList.add('aos-animate');
        }
      });
    }, 150);
    return () => clearTimeout(timer);
  }, [loaded, profile, projects, skills, certificates]);

  return (
    <>
      <Navbar />
      <main id="main-content">
        <Hero profile={profile} />
        <About profile={profile} projectCount={projects.length} />
        <Skills skills={skills} technologies={technologies} />
        <Projects projects={projects} technologies={technologies} />
        <Certificates certificates={certificates} />
        <Contact profile={profile} />
      </main>
      <Footer profile={profile} />
    </>
  );
}
