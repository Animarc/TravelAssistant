import { apiRequest, saveSession, SESSION_API_URL } from './client';
import type { AuthResponse, UserProfileResponse, UserSearchResult } from './contracts';

export const sessionApi = {
  checkBrowserSessionSupport: async () => {
    await apiRequest<void>(SESSION_API_URL, '/api/auth/browser/cookie-probe/start', { method: 'POST' }, false);
    return (await apiRequest<{ supported: boolean }>(SESSION_API_URL, '/api/auth/browser/cookie-probe/complete', { method: 'POST' }, false)).supported;
  },
  login: async (email: string, password: string) => {
    const session = await apiRequest<AuthResponse>(SESSION_API_URL, '/api/auth/browser/login', {
      method: 'POST', body: JSON.stringify({ email, password })
    }, false);
    saveSession(session);
    return session;
  },
  register: async (email: string, password: string, firstName: string, lastName: string) => {
    const session = await apiRequest<AuthResponse>(SESSION_API_URL, '/api/auth/browser/register', {
      method: 'POST', body: JSON.stringify({ email, password, firstName, lastName, preferredLanguage: 'es' })
    }, false);
    saveSession(session);
    return session;
  },
  google: async (idToken: string) => {
    const session = await apiRequest<AuthResponse>(SESSION_API_URL, '/api/auth/browser/google', { method: 'POST', body: JSON.stringify({ idToken }) }, false);
    saveSession(session); return session;
  },
  apple: async (idToken: string, firstName?: string, lastName?: string) => {
    const session = await apiRequest<AuthResponse>(SESSION_API_URL, '/api/auth/browser/apple', { method: 'POST', body: JSON.stringify({ idToken, firstName, lastName }) }, false);
    saveSession(session); return session;
  },
  restore: async () => {
    const session = await apiRequest<AuthResponse>(SESSION_API_URL, '/api/auth/browser/refresh', { method: 'POST' }, false);
    saveSession(session);
    return session;
  },
  profile: () => apiRequest<UserProfileResponse>(SESSION_API_URL, '/api/users/me'),
  searchUsers: (query: string) => apiRequest<UserSearchResult[]>(SESSION_API_URL, `/api/users/search?query=${encodeURIComponent(query)}`),
  logout: async () => {
    await apiRequest<void>(SESSION_API_URL, '/api/auth/browser/logout', { method: 'POST' });
    saveSession(null);
  }
};
