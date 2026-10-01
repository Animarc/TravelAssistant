import { useResolvedTheme } from '../theme';
import { useEffect, useRef, useState } from 'react';
import { prepareGoogleButton } from '../api/socialAuth';
import { useTranslation } from '../hooks/useTranslation';
import type { Language } from '../types';

interface Props { language: Language; onCredential: (credential: string) => Promise<void>; onError: () => void; }
export default function GoogleSignInButton({ language, onCredential, onError }: Props) {
  const appearance = useResolvedTheme();
  const container = useRef<HTMLDivElement>(null);
  const { t } = useTranslation(language);
  const [attempt, setAttempt] = useState(0);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  useEffect(() => {
    let active = true;
    const element = container.current;
    const controller = new AbortController();
    let refresh: ReturnType<typeof setTimeout>;
    let expiry: ReturnType<typeof setTimeout>;
    const fail = () => { if (active) { setStatus('error'); onError(); } };
    const setup = async () => {
      if (!active || !container.current) return;
      setStatus('loading');
      try {
        const render = await prepareGoogleButton(controller.signal);
        if (!active || !container.current) return;
        container.current.replaceChildren();
        let received = false;
        render(container.current, language, credential => {
          if (!active || received) return;
          received = true;
          setStatus('loading');
          clearTimeout(refresh); clearTimeout(expiry);
          void onCredential(credential).then(() => { if (active) void setup(); }).catch(fail);
        }, () => {
          // Keep this challenge stable while Google is returning the credential.
          clearTimeout(refresh);
          expiry = setTimeout(() => void setup(), 5 * 60_000);
        }, appearance);
        setStatus('ready');
        refresh = setTimeout(() => void setup(), 4 * 60_000);
      } catch { fail(); }
    };
    void setup();
    return () => { active = false; controller.abort(); clearTimeout(refresh); clearTimeout(expiry); element?.replaceChildren(); };
  }, [language, onCredential, onError, attempt, appearance]);
  return <div className="google-sign-in">
    <div className="google-button-slot" ref={container} hidden={status !== 'ready'} />
    {status !== 'ready' && <button type="button" disabled={status === 'loading'} onClick={() => setAttempt(value => value + 1)}>{status === 'loading' ? t('connecting') : t('continueGoogle')}</button>}
  </div>;
}
