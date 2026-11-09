const API_BASE = 'http://localhost:3000/api/v1';

function getToken() {
  return localStorage.getItem('token');
}

function getHeaders() {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const res = await fetch(url, {
    ...options,
    headers: getHeaders(),
  });
  if (res.status === 401) {
    logout();
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }
  return res;
}

export async function login(email: string, password: string) {
  const res = await fetch(`${API_BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return res.json();
}

export async function signup(name: string, email: string, password: string) {
  const res = await fetch(`${API_BASE}/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  });
  return res.json();
}

export async function getCourses() {
  const res = await fetchWithAuth(`${API_BASE}/courses`);
  return res.json();
}

export async function getPresentations(courseId: number) {
  const res = await fetchWithAuth(`${API_BASE}/courses/${courseId}/presentations`);
  return res.json();
}

export async function getPresentation(id: number) {
  const res = await fetchWithAuth(`${API_BASE}/presentations/${id}`);
  return res.json();
}

export async function createPresentation(courseId: number, data: {
  title: string;
  description?: string;
  presentation_date: string;
  presenter_ids?: number[];
}) {
  const res = await fetchWithAuth(`${API_BASE}/courses/${courseId}/presentations`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function submitEvaluation(presentationId: number, data: {
  clarity_score: number;
  organization_score: number;
  delivery_score: number;
  overall_score: number;
  comments?: string;
}) {
  const res = await fetchWithAuth(`${API_BASE}/presentations/${presentationId}/evaluations`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function getMyPresentations() {
  const res = await fetchWithAuth(`${API_BASE}/my_presentations`);
  return res.json();
}

export async function getPresentationStats(presentationId: number) {
  const res = await fetchWithAuth(`${API_BASE}/presentations/${presentationId}/stats`);
  return res.json();
}

export async function getCourseMembers(courseId: number) {
  const res = await fetchWithAuth(`${API_BASE}/courses/${courseId}/members`);
  return res.json();
}

export function saveAuth(token: string, user: { id: number; name: string; email: string; role: string }) {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
}

export function getUser() {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
}

export function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

export function isLoggedIn() {
  return !!getToken();
}
