// ===================================
// API UTILITY - All fetch calls
// ===================================

const API_BASE = '/api';

async function apiFetch(endpoint, options = {}) {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    credentials: 'include',
    ...options,
  });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  return response.json();
}

// ── Public API ──────────────────────────────────────────────
export async function fetchProfile() {
  try { return await apiFetch('/profile'); } catch { return null; }
}

export async function fetchSkills() {
  try { return await apiFetch('/skills'); } catch { return []; }
}

export async function fetchProjects() {
  try { return await apiFetch('/projects'); } catch { return []; }
}

export async function fetchCertificates() {
  try { return await apiFetch('/certificates'); } catch { return []; }
}

export async function fetchTechnologies() {
  try { return await apiFetch('/technologies'); } catch { return []; }
}

export async function submitContact(formData) {
  return apiFetch('/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData),
    credentials: 'include',
  });
}

// ── Admin API ───────────────────────────────────────────────
export async function checkAuth() {
  try {
    const data = await apiFetch('/check-auth');
    return data.authenticated === true;
  } catch { return false; }
}

export async function login(username, password) {
  return apiFetch('/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
}

export async function logout() {
  try { await apiFetch('/logout', { method: 'POST' }); } catch { /* ignore */ }
}

export async function fetchDashboardStats() {
  return apiFetch('/dashboard');
}

export async function fetchActivity() {
  try { return await apiFetch('/activity'); } catch { return []; }
}

export async function fetchVisitors() {
  try { return await apiFetch('/visitors'); } catch { return []; }
}

export async function fetchMessages() {
  try { return await apiFetch('/messages'); } catch { return []; }
}

export async function deleteMessage(id) {
  return apiFetch(`/messages/${id}`, { method: 'DELETE' });
}

export async function saveProfile(formData) {
  return fetch(`${API_BASE}/profile`, {
    method: 'POST',
    credentials: 'include',
    body: formData, // FormData for multipart
  }).then(r => r.json());
}

export async function addSkill(data) {
  return apiFetch('/skills', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
}

export async function updateSkill(id, data) {
  return apiFetch(`/skills/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
}

export async function deleteSkill(id) {
  return apiFetch(`/skills/${id}`, { method: 'DELETE' });
}

export async function deleteSkillsByCategory(category) {
  return apiFetch(`/skills/category/${encodeURIComponent(category)}`, { method: 'DELETE' });
}

export async function addProject(formData) {
  return fetch(`${API_BASE}/projects`, {
    method: 'POST', credentials: 'include', body: formData,
  }).then(r => r.json());
}

export async function updateProject(id, formData) {
  return fetch(`${API_BASE}/projects/${id}`, {
    method: 'PUT', credentials: 'include', body: formData,
  }).then(r => r.json());
}

export async function deleteProject(id) {
  return apiFetch(`/projects/${id}`, { method: 'DELETE' });
}

export async function addCertificate(formData) {
  return fetch(`${API_BASE}/certificates`, {
    method: 'POST', credentials: 'include', body: formData,
  }).then(r => r.json());
}

export async function updateCertificate(id, formData) {
  return fetch(`${API_BASE}/certificates/${id}`, {
    method: 'PUT', credentials: 'include', body: formData,
  }).then(r => r.json());
}

export async function deleteCertificate(id) {
  return apiFetch(`/certificates/${id}`, { method: 'DELETE' });
}

export async function uploadResume(formData) {
  return fetch(`${API_BASE}/resume`, {
    method: 'POST', credentials: 'include', body: formData,
  }).then(r => r.json());
}

export async function deleteResume() {
  return apiFetch('/resume', { method: 'DELETE' });
}

export async function fetchSkillCategories() {
  try { return await apiFetch('/skill-categories'); } catch { return []; }
}

export async function addSkillCategory(data) {
  return apiFetch('/skill-categories', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
}
