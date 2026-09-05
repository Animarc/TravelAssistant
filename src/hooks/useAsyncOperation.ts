import { useCallback, useState } from 'react';
import { ApiError } from '../api/client';
import type { TranslationKey } from '../i18n/translations';

export type SaveStatus = 'idle' | 'saving' | 'saveError';

export const getErrorKey = (error: unknown): TranslationKey => {
  if (!(error instanceof ApiError)) return 'errorUnexpected';
  const exact: Partial<Record<string, TranslationKey>> = {
    'network.unavailable': 'errorNetwork',
    'auth.invalid_credentials': 'errorInvalidCredentials',
    'user.email_conflict': 'errorEmailConflict',
    'auth.session_expired': 'errorSessionExpired',
    'auth.invalid_refresh_token': 'errorSessionExpired',
    'auth.google_failed': 'socialLoginError',
    'auth.apple_failed': 'socialLoginError',
    'auth.oauth_challenge_invalid': 'socialLoginError',
    'auth.email_unverified': 'errorEmailUnverified',
    'email.verification_invalid': 'errorVerificationInvalid',
    'email.delivery_failed': 'errorVerificationDelivery'
  };
  if (exact[error.code]) return exact[error.code]!;
  if (error.code.startsWith('validation.') || error.status === 400 || error.status === 422) return 'errorValidation';
  if (error.status === 401) return 'errorSessionExpired';
  if (error.status === 403) return 'errorPermission';
  if (error.status === 404) return 'errorNotFound';
  if (error.status === 409) return 'errorConflict';
  if (error.status === 429) return 'errorRateLimited';
  if (error.status >= 500) return 'errorServer';
  return 'errorRequest';
};

export const useAsyncOperation = () => {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [error, setError] = useState<TranslationKey | null>(null);
  const [failedOperation, setFailedOperation] = useState<(() => Promise<void>) | null>(null);
  const clearError = useCallback(() => setError(null), []);

  const run = useCallback(async (operation: () => Promise<void>) => {
    setSaveStatus('saving');
    setError(null);
    try {
      await operation();
      setSaveStatus('idle');
      setFailedOperation(null);
    } catch (reason) {
      setSaveStatus('saveError');
      setError(getErrorKey(reason));
      setFailedOperation(() => operation);
      throw reason;
    }
  }, []);

  const retry = useCallback(async () => {
    if (!failedOperation) return;
    await run(failedOperation);
  }, [failedOperation, run]);

  return { saveStatus, error, setError, clearError, run, retry, canRetry: failedOperation !== null };
};
