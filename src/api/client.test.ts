import { afterEach, describe, expect, it, vi } from 'vitest';
import { apiRequest, getStoredSession, saveSession, SESSION_API_URL } from './client';
import type { AuthResponse } from './contracts';

const session: AuthResponse = {
  userId: 'user-1', email: 'marc@example.com', firstName: 'Marc', lastName: 'Viajero',
  avatarUrl: null, accessToken: 'access-token', expiresAt: '2026-01-01T00:00:00Z'
};

describe('API session client', () => {
  afterEach(() => { saveSession(null); vi.unstubAllGlobals(); localStorage.clear(); });

  it('keeps credentials in memory rather than browser storage', () => {
    saveSession(session);
    expect(getStoredSession()).toEqual(session);
    expect(localStorage.length).toBe(0);
  });

  it('sends browser-session requests with credentials included', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify(session), {
      status: 200, headers: { 'Content-Type': 'application/json' }
    }));
    vi.stubGlobal('fetch', fetchMock);
    await apiRequest<AuthResponse>(SESSION_API_URL, '/api/auth/browser/refresh', { method: 'POST' }, false);
    expect(fetchMock).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({ credentials: 'include' }));
  });
});
