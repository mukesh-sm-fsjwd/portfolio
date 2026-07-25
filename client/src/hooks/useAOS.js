import { useEffect, useRef } from 'react';

// ===================================
// useAOS — Animate On Scroll using IntersectionObserver
// Applies/removes the 'aos-animate' class to [data-aos] children
// =================================== 
export function useAOS(rootMargin = '-80px') {
  const containerRef = useRef(null);

  useEffect(() => {
    const elements = document.querySelectorAll('[data-aos]');

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('aos-animate');
          }
        });
      },
      { rootMargin, threshold: 0.1 }
    );

    elements.forEach((el) => observer.observe(el));

    return () => {
      elements.forEach((el) => observer.unobserve(el));
    };
  }, [rootMargin]);

  return containerRef;
}
