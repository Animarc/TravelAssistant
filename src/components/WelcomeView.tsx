import { useState, type FormEvent } from 'react';
import { useApp } from '../context/AppContext';
import { useTranslation } from '../hooks/useTranslation';
import '../styles/welcome.css';
import PublicTripsExplorer from './PublicTripsExplorer';
import { requestAppleCredential, requestGoogleCredential } from '../api/socialAuth';

const GoogleIcon = () => <svg className="social-provider-icon" viewBox="0 0 24 24" aria-hidden="true">
  <path fill="#4285F4" d="M21.6 12.23c0-.71-.06-1.4-.18-2.07H12v3.92h5.38a4.6 4.6 0 0 1-2 3.02v2.54h3.24c1.9-1.75 2.98-4.33 2.98-7.41Z" />
  <path fill="#34A853" d="M12 22c2.7 0 4.97-.9 6.62-2.36l-3.24-2.54c-.9.6-2.05.96-3.38.96-2.6 0-4.81-1.76-5.6-4.13H3.06v2.62A10 10 0 0 0 12 22Z" />
  <path fill="#FBBC05" d="M6.4 13.93A6.02 6.02 0 0 1 6.08 12c0-.67.12-1.32.32-1.93V7.45H3.06A10 10 0 0 0 2 12c0 1.61.39 3.14 1.06 4.55l3.34-2.62Z" />
  <path fill="#EA4335" d="M12 5.94c1.47 0 2.79.5 3.82 1.5l2.87-2.87A9.62 9.62 0 0 0 12 2a10 10 0 0 0-8.94 5.45l3.34 2.62C7.19 7.7 9.4 5.94 12 5.94Z" />
</svg>;

const AppleIcon = () => <svg className="social-provider-icon apple-icon" viewBox="0 0 16 16" aria-hidden="true">
  <path d="M11.182.008c.163 1.106-.3 2.2-.9 2.91-.64.76-1.74 1.34-2.8 1.26-.19-1.06.3-2.16.9-2.84.67-.75 1.78-1.32 2.8-1.33ZM14.44 11.2c-.32.74-.7 1.42-1.22 2.21-.67 1.02-1.62 2.29-2.8 2.3-1.04.01-1.31-.68-2.73-.67-1.42.01-1.71.69-2.75.68-1.18-.01-2.08-1.16-2.75-2.18C.31 10.68.11 7.33 1.27 5.55c.83-1.27 2.14-2.01 3.38-2.01 1.26 0 2.05.69 3.09.69 1 0 1.62-.69 3.07-.69 1.1 0 2.26.6 3.09 1.64-2.72 1.49-2.28 5.37.54 6.02Z" />
</svg>;

const WelcomeView = () => {
  const { state, login, register, loginWithGoogle, loginWithApple, openPublicPreview } = useApp();
  const { t } = useTranslation(state.language);
  const [mode, setMode] = useState<'login' | 'register'>(() => {
    const requested = sessionStorage.getItem('kakomu.authMode');
    sessionStorage.removeItem('kakomu.authMode');
    return requested === 'register' ? 'register' : 'login';
  });
  const [socialError, setSocialError] = useState<string | null>(null);
  const [form, setForm] = useState({ email: '', password: '', firstName: '', lastName: '' });

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    try {
      if (mode === 'login') await login(form.email, form.password);
      else await register(form.email, form.password, form.firstName, form.lastName);
    } catch { /* The application state displays the API error. */ }
  };

  return (
    <main className="welcome-view">
      <section className="welcome-access" aria-labelledby="welcome-title">
        <span className="welcome-kicker">Kakomu</span>
        <h1 id="welcome-title">{t('welcomeTitle')}</h1>
        <p className="welcome-intro">{t('welcomeIntro')}</p>

        <div className="auth-switch" role="tablist" aria-label={t('accountAccess')}>
          <button type="button" role="tab" aria-selected={mode === 'login'} className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')}>{t('login')}</button>
          <button type="button" role="tab" aria-selected={mode === 'register'} className={mode === 'register' ? 'active' : ''} onClick={() => setMode('register')}>{t('createAccount')}</button>
        </div>

        <form className="welcome-form" onSubmit={submit}>
          {mode === 'register' && <div className="welcome-name-row">
            <label>{t('firstName')}<input required autoComplete="given-name" value={form.firstName} onChange={event => setForm({ ...form, firstName: event.target.value })} /></label>
            <label>{t('lastName')}<input required autoComplete="family-name" value={form.lastName} onChange={event => setForm({ ...form, lastName: event.target.value })} /></label>
          </div>}
          <label>{t('email')}<input type="email" required autoComplete="email" value={form.email} onChange={event => setForm({ ...form, email: event.target.value })} /></label>
          <label>{t('password')}<input type="password" required minLength={mode === 'register' ? 8 : 1} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} value={form.password} onChange={event => setForm({ ...form, password: event.target.value })} /></label>
          <button className="welcome-submit" disabled={state.authLoading}>{state.authLoading ? t('connecting') : mode === 'login' ? t('login') : t('createAccount')}</button>
        </form>
        <div className="social-divider"><span>{t('or')}</span></div>
        <div className="social-access">
          <button type="button" onClick={() => { setSocialError(null); void requestGoogleCredential().then(loginWithGoogle).catch(() => setSocialError(t('socialLoginError'))); }}><GoogleIcon />{t('continueGoogle')}</button>
          <button type="button" onClick={() => { setSocialError(null); void requestAppleCredential().then(value => loginWithApple(value.idToken, value.firstName, value.lastName)).catch(() => setSocialError(t('socialLoginError'))); }}><AppleIcon />{t('continueApple')}</button>
        </div>
        {socialError && <div className="welcome-error" role="alert">{socialError}</div>}
        {state.error && <div className="welcome-error" role="alert">{state.error}</div>}
      </section>

      <section className="welcome-preview" aria-label={t('productPreview')}><PublicTripsExplorer onOpen={openPublicPreview} onRegister={() => setMode('register')} /></section>
    </main>
  );
};

export default WelcomeView;
