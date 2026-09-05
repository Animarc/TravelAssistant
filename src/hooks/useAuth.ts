import { useCallback, useEffect, useState } from 'react';
import { ApiError, saveSession } from '../api/client';
import { sessionApi } from '../api/sessionApi';
import type { AuthResponse, UserProfileResponse } from '../api/contracts';
import type { AuthUser } from '../types';
import { getErrorKey } from './useAsyncOperation';
import type { TranslationKey } from '../i18n/translations';

const userFromSession = (session: AuthResponse): AuthUser => ({
  userId: session.userId, email: session.email, firstName: session.firstName,
  lastName: session.lastName, avatarUrl: session.avatarUrl ?? undefined
});

const userFromProfile = (profile: UserProfileResponse): AuthUser => ({
  userId: profile.id, email: profile.email, firstName: profile.firstName,
  lastName: profile.lastName, avatarUrl: profile.avatarUrl ?? undefined
});

export const useAuth = (loadTrips: () => Promise<void>, resetTrips: () => void, setError: (message: TranslationKey | null) => void) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [browserSessionSupport, setBrowserSessionSupport] = useState<'checking' | 'supported' | 'unsupported' | 'unknown'>('checking');
  const [verificationState, setVerificationState] = useState<'idle' | 'pending' | 'verifying' | 'verified' | 'invalid' | 'resent'>('idle');
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        setBrowserSessionSupport(await sessionApi.checkBrowserSessionSupport() ? 'supported' : 'unsupported');
      } catch {
        setBrowserSessionSupport('unknown');
      }
      const verificationToken = new URLSearchParams(window.location.search).get('verifyEmail');
      if (verificationToken) {
        setVerificationState('verifying');
        try {
          await sessionApi.verifyEmail(verificationToken);
          setVerificationState('verified');
        } catch {
          setVerificationState('invalid');
        } finally {
          const url = new URL(window.location.href);
          url.searchParams.delete('verifyEmail');
          window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
        }
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
      if (reason instanceof ApiError && reason.code === 'auth.email_unverified') {
        setVerificationState('pending');
      } else setError(getErrorKey(reason));
      throw reason;
    } finally {
      setAuthLoading(false);
    }
  }, [loadTrips, setError]);

  const login = useCallback(async (email: string, password: string) => {
    try { await authenticate(() => sessionApi.login(email, password)); }
    catch (reason) {
      if (reason instanceof ApiError && reason.code === 'auth.email_unverified') setPendingVerificationEmail(email);
      throw reason;
    }
  }, [authenticate]);

  const register = useCallback(async (email: string, password: string, firstName: string, lastName: string, preferredLanguage: string) => {
    setAuthLoading(true); setError(null);
    try {
      await sessionApi.register(email, password, firstName, lastName, preferredLanguage);
      setPendingVerificationEmail(email);
      setVerificationState('pending');
    } catch (reason) { setError(getErrorKey(reason)); throw reason; }
    finally { setAuthLoading(false); }
  }, [setError]);

  const resendVerification = useCallback(async () => {
    if (!pendingVerificationEmail) return;
    setAuthLoading(true); setError(null);
    try { await sessionApi.resendVerification(pendingVerificationEmail); setVerificationState('resent'); }
    catch (reason) { setError(getErrorKey(reason)); throw reason; }
    finally { setAuthLoading(false); }
  }, [pendingVerificationEmail, setError]);

  const dismissVerification = useCallback(() => { setVerificationState('idle'); setPendingVerificationEmail(null); setError(null); }, [setError]);
  const loginWithGoogle = useCallback((idToken: string) => authenticate(() => sessionApi.google(idToken)), [authenticate]);
  const loginWithApple = useCallback((idToken: string, firstName?: string, lastName?: string) => authenticate(() => sessionApi.apple(idToken, firstName, lastName)), [authenticate]);

  const logout = useCallback(async () => {
    try { await sessionApi.logout(); } catch { saveSession(null); }
    setUser(null);
    setError(null);
    resetTrips();
  }, [resetTrips, setError]);

  return { user, authLoading, isAuthenticated: user !== null, browserSessionSupport, verificationState,
    pendingVerificationEmail, login, register, resendVerification, dismissVerification, loginWithGoogle, loginWithApple, logout };
};
