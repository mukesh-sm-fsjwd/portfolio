import { useState, useEffect, useRef } from 'react';

// ===================================
// useTypingEffect — Port of TypingEffect class from app.js
// ===================================
export function useTypingEffect(texts, speed = 100, deleteSpeed = 50, pauseMs = 2000) {
  const [displayText, setDisplayText] = useState('');
  const indexRef = useRef(0);
  const charRef = useRef(0);
  const isDeletingRef = useRef(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!texts || texts.length === 0) return;

    function tick() {
      const current = texts[indexRef.current];
      const isDeleting = isDeletingRef.current;

      if (isDeleting) {
        setDisplayText(current.substring(0, charRef.current - 1));
        charRef.current -= 1;

        if (charRef.current === 0) {
          isDeletingRef.current = false;
          indexRef.current = (indexRef.current + 1) % texts.length;
          timerRef.current = setTimeout(tick, 400);
          return;
        }
        timerRef.current = setTimeout(tick, deleteSpeed);
      } else {
        setDisplayText(current.substring(0, charRef.current + 1));
        charRef.current += 1;

        if (charRef.current === current.length) {
          isDeletingRef.current = true;
          timerRef.current = setTimeout(tick, pauseMs);
          return;
        }
        timerRef.current = setTimeout(tick, speed);
      }
    }

    timerRef.current = setTimeout(tick, 500);
    return () => clearTimeout(timerRef.current);
  }, [texts, speed, deleteSpeed, pauseMs]);

  return displayText;
}
