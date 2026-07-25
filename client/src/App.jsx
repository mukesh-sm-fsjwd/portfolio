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
import { fetchProfile, fetchSkills, fetchProjects, fetchCertificates, fetchTechnologies } from './utils/api';
import { initVisitorTracking } from './utils/visitorTracking';

export default function App() {
  const [profile, setProfile] = useState(null);
  const [skills, setSkills] = useState([]);
  const [projects, setProjects] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [technologies, setTechnologies] = useState([]);
  const [loading, setLoading] = useState(true);

  // Initialize AOS scroll animations
  useAOS('-80px');

  // Init visitor tracking on mount
  useEffect(() => {
    initVisitorTracking();
  }, []);

  // Fetch all data in parallel
  useEffect(() => {
    async function loadAll() {
      try {
        const [profileData, skillsData, projectsData, certsData, techData] = await Promise.all([
          fetchProfile(),
          fetchSkills(),
          fetchProjects(),
          fetchCertificates(),
          fetchTechnologies(),
        ]);
        setProfile(profileData);
        setSkills(skillsData || []);
        setProjects(projectsData || []);
        setCertificates(certsData || []);
        setTechnologies(techData || []);
      } catch (err) {
        console.error('Error loading portfolio data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadAll();
  }, []);

  // Re-run AOS after content loads
  useEffect(() => {
    if (!loading) {
      // Trigger re-scan for newly rendered elements
      setTimeout(() => {
        document.querySelectorAll('[data-aos]').forEach(el => {
          const rect = el.getBoundingClientRect();
          if (rect.top < window.innerHeight - 80) {
            el.classList.add('aos-animate');
          }
        });
      }, 100);
    }
  }, [loading]);

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
