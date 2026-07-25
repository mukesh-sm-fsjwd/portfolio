import { useRef, useCallback } from 'react';

// ===================================
// useCardTilt — 3D card tilt effect on mouse move
// Port of the CardTilt class from app.js
// =================================== 
export function useCardTilt(strength = 15) {
  const ref = useRef(null);

  const onMouseMove = useCallback((e) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -strength;
    const rotateY = ((x - centerX) / centerX) * strength;
    el.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(20px)`;
  }, [strength]);

  const onMouseLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0)';
    el.style.transition = 'transform 0.5s ease';
  }, []);

  const onMouseEnter = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.transition = 'transform 0.1s ease';
  }, []);

  return { ref, onMouseMove, onMouseLeave, onMouseEnter };
}
