import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApiError, apiRequest, getStoredSession, saveSession, SESSION_API_URL } from './client';
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

  it('never exposes server prose as the error message', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({
      status: 500, code: 'database.internal', detail: 'password=secret; host=private-db'
    }), { status: 500, headers: { 'Content-Type': 'application/problem+json' } })));
    const error = await apiRequest(SESSION_API_URL, '/failure', {}, false).catch(reason => reason);
    expect(error).toBeInstanceOf(ApiError);
    const apiError = error as ApiError;
    expect(apiError.message).toBe('database.internal');
    expect(apiError.message).not.toContain('private-db');
  });

  it('normalizes network failures', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch https://private-host')));
    const error = await apiRequest(SESSION_API_URL, '/failure', {}, false).catch(reason => reason);
    expect(error).toMatchObject({ status: 0, code: 'network.unavailable', message: 'network.unavailable' });
  });
});
