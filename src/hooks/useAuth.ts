import { useCallback, useEffect, useState } from 'react';
import { ApiError, saveSession } from '../api/client';
import { sessionApi } from '../api/sessionApi';
import type { AuthResponse, UserProfileResponse } from '../api/contracts';
import type { AuthUser } from '../types';
import { getErrorMessage } from './useAsyncOperation';

const userFromSession = (session: AuthResponse): AuthUser => ({
  userId: session.userId, email: session.email, firstName: session.firstName,
  lastName: session.lastName, avatarUrl: session.avatarUrl ?? undefined
});

const userFromProfile = (profile: UserProfileResponse): AuthUser => ({
  userId: profile.id, email: profile.email, firstName: profile.firstName,
  lastName: profile.lastName, avatarUrl: profile.avatarUrl ?? undefined
});

export const useAuth = (loadTrips: () => Promise<void>, resetTrips: () => void, setError: (message: string | null) => void) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      try {
        await sessionApi.restore();
        setUser(userFromProfile(await sessionApi.profile()));
        await loadTrips();
      } catch (reason) {
        saveSession(null);
        setUser(null);
        if (!(reason instanceof ApiError && reason.status === 401)) setError(getErrorMessage(reason));
      } finally {
        setAuthLoading(false);
      }
    })();
  }, [loadTrips, setError]);

  const authenticate = useCallback(async (request: () => Promise<AuthResponse>) => {
    setAuthLoading(true);
    setError(null);
    try {
      const session = await request();
      setUser(userFromSession(session));
      await loadTrips();
    } catch (reason) {
      setError(getErrorMessage(reason));
      throw reason;
    } finally {
      setAuthLoading(false);
    }
  }, [loadTrips, setError]);

  const login = useCallback((email: string, password: string) =>
    authenticate(() => sessionApi.login(email, password)), [authenticate]);

  const register = useCallback((email: string, password: string, firstName: string, lastName: string) =>
    authenticate(() => sessionApi.register(email, password, firstName, lastName)), [authenticate]);
  const loginWithGoogle = useCallback((idToken: string) => authenticate(() => sessionApi.google(idToken)), [authenticate]);
  const loginWithApple = useCallback((idToken: string, firstName?: string, lastName?: string) => authenticate(() => sessionApi.apple(idToken, firstName, lastName)), [authenticate]);

  const logout = useCallback(async () => {
    try { await sessionApi.logout(); } catch { saveSession(null); }
    setUser(null);
    setError(null);
    resetTrips();
  }, [resetTrips, setError]);

  return { user, authLoading, isAuthenticated: user !== null, login, register, loginWithGoogle, loginWithApple, logout };
};
