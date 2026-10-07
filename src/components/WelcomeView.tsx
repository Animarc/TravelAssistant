import LandingDetails from './LandingDetails';
import GoogleSignInButton from './GoogleSignInButton';
import type { TranslationKey } from '../i18n/translations';
import { useCallback, useState, type FormEvent } from 'react';
import { useApp } from '../context/AppContext';
import { useTranslation } from '../hooks/useTranslation';
import '../styles/welcome.css';
import PublicTripsExplorer from './PublicTripsExplorer';
import PasswordResetView from './PasswordResetView';

const WelcomeView = () => {
  const { state, login, register, loginWithGoogle, openPublicPreview } = useApp();
  const { t } = useTranslation(state.language);
  const [mode, setMode] = useState<'login' | 'register'>(() => {
    const requested = sessionStorage.getItem('tabiji-log.authMode') ?? sessionStorage.getItem('kakomu.authMode');
    sessionStorage.removeItem('tabiji-log.authMode');
    sessionStorage.removeItem('kakomu.authMode');
    return requested === 'register' ? 'register' : 'login';
  });
  const [recovering, setRecovering] = useState(false);
  const [socialError, setSocialError] = useState<TranslationKey | null>(null);
  const googleCredential = useCallback((credential: string) => { setSocialError(null); return loginWithGoogle(credential); }, [loginWithGoogle]);
  const googleError = useCallback(() => setSocialError('socialLoginError'), []);
  const [form, setForm] = useState({ email: '', password: '', username: '' });

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    try {
      if (mode === 'login') await login(form.email, form.password);
      else await register(form.email, form.password, form.username);
    } catch { /* The application state displays the API error. */ }
  };

  if (recovering) return <PasswordResetView onBack={() => setRecovering(false)} />;
  return (
    <main className="welcome-view">
      <section className="welcome-access" aria-labelledby="welcome-title">
        <span className="welcome-kicker">Tabiji Log</span>
        <h1 id="welcome-title">{t('welcomeTitle')}</h1>
        <p className="welcome-intro">{t('welcomeIntro')}</p>
        <LandingDetails language={state.language} />

        <div className="auth-switch" role="tablist" aria-label={t('accountAccess')}>
          <button type="button" role="tab" aria-selected={mode === 'login'} className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')}>{t('login')}</button>
          <button type="button" role="tab" aria-selected={mode === 'register'} className={mode === 'register' ? 'active' : ''} onClick={() => setMode('register')}>{t('createAccount')}</button>
        </div>

        <form className="welcome-form" onSubmit={submit}>
          {mode === 'register' && <label>{t('username')}<input required minLength={3} maxLength={30} pattern="[A-Za-z0-9_]+" autoComplete="username" value={form.username} onChange={event => setForm({ ...form, username: event.target.value })} /><small>{t('usernameHint')}</small></label>}
          <label>{t('email')}<input type="email" required autoComplete="email" value={form.email} onChange={event => setForm({ ...form, email: event.target.value })} /></label>
          <label>{t('password')}<input type="password" required minLength={mode === 'register' ? 8 : 1} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} value={form.password} onChange={event => setForm({ ...form, password: event.target.value })} /></label>
          <button className="welcome-submit" disabled={state.authLoading}>{state.authLoading ? t('connecting') : mode === 'login' ? t('login') : t('createAccount')}</button>
        </form>
        {mode === 'login' && <button type="button" className="text-button" onClick={() => setRecovering(true)}>{t('forgotPassword')}</button>}
        <div className="social-divider"><span>{t('or')}</span></div>
        <div className="social-access">
          <GoogleSignInButton language={state.language} onCredential={googleCredential} onError={googleError} />
        </div>
        {socialError && <div className="welcome-error" role="alert">{t(socialError)}</div>}
        {state.browserSessionSupport === 'unsupported' && <div className="welcome-error" role="alert">{t('browserSessionUnsupported')}</div>}
        {state.error && <div className="welcome-error" role="alert">{t(state.error)}</div>}
      </section>

      <section className="welcome-preview" aria-label={t('productPreview')}><PublicTripsExplorer onOpen={openPublicPreview} onRegister={() => setMode('register')} /></section>
    </main>
  );
};

export default WelcomeView;
