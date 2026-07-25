import { useState, useEffect } from 'react';

// ===================================
// useScrollSpy — Returns active section ID for navbar highlight
// ===================================
export function useScrollSpy(sectionIds, offset = 100) {
  const [activeId, setActiveId] = useState(sectionIds[0] || '');

  useEffect(() => {
    function onScroll() {
      const scrollPos = window.scrollY + offset;

      for (let i = sectionIds.length - 1; i >= 0; i--) {
        const el = document.getElementById(sectionIds[i]);
        if (el && el.offsetTop <= scrollPos) {
          setActiveId(sectionIds[i]);
          return;
        }
      }
      setActiveId(sectionIds[0] || '');
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // run once on mount
    return () => window.removeEventListener('scroll', onScroll);
  }, [sectionIds, offset]);

  return activeId;
}
