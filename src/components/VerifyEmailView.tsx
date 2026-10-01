import type { Language } from '../types';
import { useEffect, useRef, useState } from 'react';
import { ApiError } from '../api/client';
import { sessionApi } from '../api/sessionApi';
import { useTranslation } from '../hooks/useTranslation';
import { resolveLanguage } from '../i18n/language';
const VerifyEmailView = ({ language }: { language?: Language }) => {
  const { t } = useTranslation(language ?? resolveLanguage(localStorage.getItem('travelAssistantLang'), navigator.languages));
  const [status, setStatus] = useState<'checking' | 'verified' | 'invalid' | 'unavailable'>('checking');
  const token = useRef(new URLSearchParams(window.location.search).get('token'));
  const request = useRef<ReturnType<typeof sessionApi.confirmEmail> | null>(null);
  const confirm = () => {
    request.current ??= sessionApi.confirmEmail(token.current!).then(async result => {
      // Refresh existing sessions so the next page gets updated verified-email claims.
      await sessionApi.restore().catch(() => undefined);
      return result;
    });
    return request.current;
  };
  useEffect(() => {
    let active = true;
    if (!token.current) { setStatus('invalid'); return; }
    const url = new URL(window.location.href); url.searchParams.delete('token');
    window.history.replaceState(window.history.state, '', url);
    request.current ??= sessionApi.confirmEmail(token.current).then(async result => {
      await sessionApi.restore().catch(() => undefined); return result;
    });
    void request.current.then(() => { if (active) setStatus('verified'); }).catch(reason => {
      if (active) setStatus(reason instanceof ApiError && reason.status === 400 ? 'invalid' : 'unavailable');
    });
    return () => { active = false; };
  }, []);
  const retry = () => {
    request.current = null; setStatus('checking');
    void confirm().then(() => setStatus('verified')).catch(reason => setStatus(reason instanceof ApiError && reason.status === 400 ? 'invalid' : 'unavailable'));
  };
  return <main className="verify-email-view"><img src={`${import.meta.env.BASE_URL}tabiji-log-mark.svg`} alt="" className="brand-mark" />
    <h1>{t(status === 'checking' ? 'emailChecking' : status === 'verified' ? 'emailConfirmed' : status === 'unavailable' ? 'emailConnectionFailed' : 'emailInvalid')}</h1>
    <p>{t(status === 'checking' ? 'emailCheckingHelp' : status === 'verified' ? 'emailConfirmedHelp' : status === 'unavailable' ? 'emailConnectionHelp' : 'emailInvalidHelp')}</p>
    {status === 'unavailable' && <button type="button" onClick={retry}>{t('retryAction')}</button>}
    {status !== 'checking' && <a href={import.meta.env.BASE_URL}>{t('emailContinue')}</a>}
  </main>;
};
export default VerifyEmailView;
