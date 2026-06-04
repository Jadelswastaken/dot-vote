const BASE = '/api';

export interface IdeaData {
  id: number;
  title: string;
  description: string;
  vote_count: number;
  status: string;
  created_by: string;
  created_at: string;
  user_has_voted: boolean;
}

export interface VoteResponse {
  vote_count: number;
  user_has_voted: boolean;
}

export interface LoginResponse {
  access: string;
  refresh: string;
  username: string;
}

function getToken(): string | null {
  return localStorage.getItem('token');
}

function authHeaders(): Record<string, string> {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(url: string, options: RequestInit = {}): Promise<Response> {
  const res = await fetch(url, options);
  if (res.status === 401 && getToken()) {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    window.location.reload();
    throw new Error('Session expired. Please sign in again.');
  }
  return res;
}

export async function login(username: string, password: string): Promise<LoginResponse> {
  const res = await fetch(`${BASE}/auth/login/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Login failed');
  localStorage.setItem('token', data.access);
  localStorage.setItem('username', data.username);
  return data;
}

export function logout(): void {
  localStorage.removeItem('token');
  localStorage.removeItem('username');
}

export async function fetchIdeas(sort: string = 'popular'): Promise<IdeaData[]> {
  const res = await request(`${BASE}/ideas/?sort=${sort}`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch ideas');
  return res.json();
}

export async function createIdea(title: string, description: string): Promise<IdeaData> {
  const res = await request(`${BASE}/ideas/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ title, description }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.title?.[0] || data.description?.[0] || data.error || 'Failed to create idea');
  return data;
}

export async function castVote(ideaId: number): Promise<VoteResponse> {
  const res = await request(`${BASE}/ideas/${ideaId}/vote/`, {
    method: 'POST',
    headers: authHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to vote');
  return data;
}

export async function removeVote(ideaId: number): Promise<VoteResponse> {
  const res = await request(`${BASE}/ideas/${ideaId}/vote/`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to remove vote');
  return data;
}
