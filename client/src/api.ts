// Override at build time with VITE_API_BASE_URL (e.g. "/api/v1" when the
// frontend is served by the Rails app itself).
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

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

export interface Course {
  id: number;
  course_code: string;
  term: string;
  section: string | null;
  title: string;
  instructor: { id: number; name: string };
  my_role: 'admin' | 'instructor' | 'ta' | 'student' | null;
}

export function isCourseStaff(course: Course | null) {
  return !!course && ['admin', 'instructor', 'ta'].includes(course.my_role ?? '');
}

export function courseLabel(course: Course) {
  const section = course.section ? `-${course.section}` : '';
  return `${course.course_code}${section}: ${course.title} (${course.term})`;
}

export async function getCourses(): Promise<Course[]> {
  const res = await fetchWithAuth(`${API_BASE}/courses`);
  return res.json();
}

export async function getCourse(id: number) {
  const res = await fetchWithAuth(`${API_BASE}/courses/${id}`);
  return res.json();
}

export async function createCourse(data: { course_code: string; term: string; section?: string; title: string }) {
  const res = await fetchWithAuth(`${API_BASE}/courses`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function addCourseMember(courseId: number, email: string, role: string) {
  const res = await fetchWithAuth(`${API_BASE}/courses/${courseId}/members`, {
    method: 'POST',
    body: JSON.stringify({ email, role }),
  });
  return res.json();
}

export async function removeCourseMember(courseId: number, userId: number) {
  const res = await fetchWithAuth(`${API_BASE}/courses/${courseId}/members/${userId}`, {
    method: 'DELETE',
  });
  if (res.status === 204) return {};
  return res.json();
}

// The course the user last picked in the event list.
export function getCurrentCourseId(): number | null {
  const id = localStorage.getItem('courseId');
  return id ? Number(id) : null;
}

export const COURSE_CHANGE_EVENT = 'course-change';

export function setCurrentCourseId(id: number) {
  if (getCurrentCourseId() === id) return;
  localStorage.setItem('courseId', String(id));
  // Lets the sidebar and the event list stay in sync.
  window.dispatchEvent(new CustomEvent(COURSE_CHANGE_EVENT, { detail: id }));
}

export async function getPresentations(courseId: number) {
  const res = await fetchWithAuth(`${API_BASE}/courses/${courseId}/presentations`);
  return res.json();
}

export async function getPresentation(id: number) {
  const res = await fetchWithAuth(`${API_BASE}/presentations/${id}`);
  return res.json();
}

export interface PresentationInput {
  title: string;
  description?: string;
  presentation_date: string;
  start_time?: string;
  end_time?: string;
  location?: string;
  presenter_ids?: number[];
}

export async function createPresentation(courseId: number, data: PresentationInput) {
  const res = await fetchWithAuth(`${API_BASE}/courses/${courseId}/presentations`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function updatePresentation(id: number, data: Partial<PresentationInput>) {
  const res = await fetchWithAuth(`${API_BASE}/presentations/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function deletePresentation(id: number) {
  const res = await fetchWithAuth(`${API_BASE}/presentations/${id}`, { method: 'DELETE' });
  if (res.status === 204) return {};
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

/** Presentations still to evaluate, in one course or (without courseId) in all of them. */
export async function getPendingEvaluations(courseId?: number) {
  const query = courseId ? `?course_id=${courseId}` : '';
  const res = await fetchWithAuth(`${API_BASE}/pending_evaluations${query}`);
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
  localStorage.removeItem('courseId');
}

export function isLoggedIn() {
  return !!getToken();
}
