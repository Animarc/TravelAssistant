import { useCallback, useState } from 'react';
import { ApiError } from '../api/client';

export type SaveStatus = 'idle' | 'saving' | 'saveError';

export const getErrorMessage = (error: unknown) =>
  error instanceof ApiError ? error.message : 'No se ha podido conectar con el servidor.';

export const useAsyncOperation = () => {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [error, setError] = useState<string | null>(null);
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
      setError(getErrorMessage(reason));
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
