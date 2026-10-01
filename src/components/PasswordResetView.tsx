import type { TranslationKey } from '../i18n/translations';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { ApiError } from '../api/client';
import { sessionApi } from '../api/sessionApi';
import { useApp } from '../context/AppContext';
import { useTranslation } from '../hooks/useTranslation';
import { getErrorKey } from '../hooks/useAsyncOperation';
const PasswordResetView = ({ confirm = false, onBack }: { confirm?: boolean; onBack?: () => void }) => {
  const { state } = useApp();
  const { t } = useTranslation(state.language);
  const token = useRef(new URLSearchParams(window.location.search).get('token'));
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [repeat, setRepeat] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [invalid, setInvalid] = useState(confirm && !token.current);
  const [error, setError] = useState<TranslationKey | null>(null);
  useEffect(() => { if (confirm) { const url = new URL(window.location.href); url.searchParams.delete('token'); window.history.replaceState(window.history.state, '', url); } }, [confirm]);
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (busy) return;
    if (confirm && password !== repeat) { setError('passwordMismatch'); return; }
    setBusy(true); setError(null);
    try {
      if (confirm) {
        const url = new URL(window.location.href); url.searchParams.delete('token');
        window.history.replaceState(window.history.state, '', url);
        await sessionApi.resetPassword(token.current!, password);
      } else await sessionApi.requestPasswordReset(email);
      setDone(true); setPassword(''); setRepeat('');
    } catch (reason) {
      if (confirm && reason instanceof ApiError && reason.status === 400) setInvalid(true);
      else setError(getErrorKey(reason));
    } finally { setBusy(false); }
  };
  return <main className="verify-email-view password-reset-view">
    <img src={`${import.meta.env.BASE_URL}tabiji-log-mark.svg`} alt="" />
    <h1>{done && confirm ? t('passwordUpdated') : t('recoverPassword')}</h1>
    {done ? <p role="status">{t(confirm ? 'passwordUpdatedHelp' : 'resetRequested')}</p> : invalid ? <><p role="alert">{t('passwordResetInvalid')}</p><a href={`${import.meta.env.BASE_URL}?forgot-password=1`}>{t('requestAnotherLink')}</a></> :
      <form className="account-form" onSubmit={submit}>
        {confirm ? <><label>{t('newPassword')}<input type="password" autoComplete="new-password" required minLength={8} maxLength={128} value={password} onChange={event => setPassword(event.target.value)} /></label><label>{t('repeatPassword')}<input type="password" autoComplete="new-password" required minLength={8} maxLength={128} value={repeat} onChange={event => setRepeat(event.target.value)} /></label></> :
          <label>{t('email')}<input type="email" autoComplete="email" required maxLength={256} value={email} onChange={event => setEmail(event.target.value)} /></label>}
        <button disabled={busy}>{busy ? t('sending') : t(confirm ? 'changePassword' : 'sendResetLink')}</button>
      </form>}
    {error && <p role="alert">{t(error)}</p>}
    {onBack ? <button type="button" onClick={onBack}>{t('backToLogin')}</button> : <a href={import.meta.env.BASE_URL}>{t('backToLogin')}</a>}
  </main>;
};
export default PasswordResetView;
