import { useCallback, useRef, useState } from 'react';

export const useSubmitLock = () => {
  const submittingRef = useRef(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitOnce = useCallback(async (operation: () => Promise<void>) => {
    if (submittingRef.current) return false;

    submittingRef.current = true;
    setIsSubmitting(true);
    try {
      await operation();
      return true;
    } finally {
      submittingRef.current = false;
      setIsSubmitting(false);
    }
  }, []);

  return { isSubmitting, submitOnce };
};