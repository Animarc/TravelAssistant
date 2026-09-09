import { useCallback, useEffect, useState } from 'react';
import { ApiError, saveSession } from '../api/client';
import { sessionApi } from '../api/sessionApi';
import type { AuthResponse, UserProfileResponse } from '../api/contracts';
import type { AuthUser } from '../types';
import { getErrorKey } from './useAsyncOperation';
import type { TranslationKey } from '../i18n/translations';

const userFromSession = (session: AuthResponse): AuthUser => ({
  userId: session.userId, email: session.email, username: session.username,
  firstName: session.firstName ?? undefined, lastName: session.lastName ?? undefined,
  avatarUrl: session.avatarUrl ?? undefined
});

const userFromProfile = (profile: UserProfileResponse): AuthUser => ({
  userId: profile.id, email: profile.email, username: profile.username,
  firstName: profile.firstName ?? undefined, lastName: profile.lastName ?? undefined,
  avatarUrl: profile.avatarUrl ?? undefined
});

export const useAuth = (loadTrips: () => Promise<void>, resetTrips: () => void, setError: (message: TranslationKey | null) => void) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [browserSessionSupport, setBrowserSessionSupport] = useState<'checking' | 'supported' | 'unsupported' | 'unknown'>('checking');

  useEffect(() => {
    void (async () => {
      try {
        setBrowserSessionSupport(await sessionApi.checkBrowserSessionSupport() ? 'supported' : 'unsupported');
      } catch {
        setBrowserSessionSupport('unknown');
      }
      try {
        await sessionApi.restore();
        setUser(userFromProfile(await sessionApi.profile()));
        await loadTrips();
      } catch (reason) {
        saveSession(null);
        setUser(null);
        if (!(reason instanceof ApiError && reason.status === 401)) setError(getErrorKey(reason));
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
      setError(getErrorKey(reason));
      throw reason;
    } finally {
      setAuthLoading(false);
    }
  }, [loadTrips, setError]);

  const login = useCallback((email: string, password: string) =>
    authenticate(() => sessionApi.login(email, password)), [authenticate]);

  const register = useCallback((email: string, password: string, username: string) =>
    authenticate(() => sessionApi.register(email, password, username)), [authenticate]);
  const loginWithGoogle = useCallback((idToken: string) => authenticate(() => sessionApi.google(idToken)), [authenticate]);
  const loginWithApple = useCallback((idToken: string, firstName?: string, lastName?: string) => authenticate(() => sessionApi.apple(idToken, firstName, lastName)), [authenticate]);

  const logout = useCallback(async () => {
    try { await sessionApi.logout(); } catch { saveSession(null); }
    setUser(null);
    setError(null);
    resetTrips();
  }, [resetTrips, setError]);

  const updateProfile = useCallback(async (firstName: string, lastName: string) => {
    setError(null);
    try {
      const profile = await sessionApi.updateProfile(firstName, lastName);
      setUser(userFromProfile(profile));
    } catch (reason) {
      setError(getErrorKey(reason));
      throw reason;
    }
  }, [setError]);

  return { user, authLoading, isAuthenticated: user !== null, browserSessionSupport, login, register, loginWithGoogle, loginWithApple, logout, updateProfile };
};
