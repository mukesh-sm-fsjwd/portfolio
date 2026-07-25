// ===================================
// VISITOR TRACKING UTILITY
// Exact port of the inline script from index.html
// ===================================

function getBrowserInfo() {
  const ua = navigator.userAgent;
  let browser = 'Unknown';
  if (ua.includes('Chrome') && !ua.includes('Edg')) browser = 'Chrome';
  else if (ua.includes('Firefox')) browser = 'Firefox';
  else if (ua.includes('Safari') && !ua.includes('Chrome')) browser = 'Safari';
  else if (ua.includes('Edg')) browser = 'Edge';
  else if (ua.includes('OPR') || ua.includes('Opera')) browser = 'Opera';

  let os = 'Unknown';
  if (ua.includes('Windows')) os = 'Windows';
  else if (ua.includes('Mac')) os = 'MacOS';
  else if (ua.includes('Android')) os = 'Android';
  else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';
  else if (ua.includes('Linux')) os = 'Linux';

  return { browser, os };
}

export function initVisitorTracking() {
  const startTime = Date.now();
  let visitId = null;

  // Log visit on load
  const { browser, os } = getBrowserInfo();
  fetch('/api/track-visit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      browser,
      os,
      screen_size: screen.width + 'x' + screen.height,
      page: window.location.pathname,
    }),
  })
    .then(r => r.json())
    .then(d => { if (d.visit_id) visitId = d.visit_id; })
    .catch(() => {});

  // Send time spent when visitor leaves
  function sendTimeSpent() {
    if (!visitId) return;
    const timeSpent = Math.round((Date.now() - startTime) / 1000);
    const payload = JSON.stringify({ visit_id: visitId, time_spent: timeSpent });
    if (navigator.sendBeacon) {
      const blob = new Blob([payload], { type: 'application/json' });
      navigator.sendBeacon('/api/track-visit-end', blob);
    } else {
      fetch('/api/track-visit-end', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
        keepalive: true,
      }).catch(() => {});
    }
  }

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') sendTimeSpent();
  });
  window.addEventListener('pagehide', sendTimeSpent);
  window.addEventListener('beforeunload', sendTimeSpent);
}
