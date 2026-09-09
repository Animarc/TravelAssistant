import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useSubmitLock } from './useSubmitLock';

describe('useSubmitLock', () => {
  it('ignores a second submission while the first one is pending', async () => {
    let finishOperation: (() => void) | undefined;
    const operation = vi.fn(() => new Promise<void>(resolve => {
      finishOperation = resolve;
    }));
    const { result } = renderHook(() => useSubmitLock());

    let firstSubmission: Promise<boolean>;
    let secondSubmission: Promise<boolean>;
    act(() => {
      firstSubmission = result.current.submitOnce(operation);
      secondSubmission = result.current.submitOnce(operation);
    });

    expect(operation).toHaveBeenCalledTimes(1);
    await expect(secondSubmission!).resolves.toBe(false);
    expect(result.current.isSubmitting).toBe(true);

    await act(async () => {
      finishOperation?.();
      await firstSubmission!;
    });

    await expect(firstSubmission!).resolves.toBe(true);
    expect(result.current.isSubmitting).toBe(false);
  });

  it('unlocks after a failed submission', async () => {
    const { result } = renderHook(() => useSubmitLock());

    await act(async () => {
      await expect(result.current.submitOnce(() => Promise.reject(new Error('failed')))).rejects.toThrow('failed');
    });

    await act(async () => {
      await expect(result.current.submitOnce(() => Promise.resolve())).resolves.toBe(true);
    });
  });
});