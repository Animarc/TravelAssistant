import { useApp } from '../context/AppContext';
import { useTranslation } from '../hooks/useTranslation';
import EmailVerificationBanner from './EmailVerificationBanner';

const RegistrationConfirmation = () => {
  const { state, setCurrentView } = useApp();
  const { t } = useTranslation(state.language);
  return <main className="registration-confirmation">
    <img src={`${import.meta.env.BASE_URL}tabiji-log-mark.svg`} alt="" className="brand-mark" />
    <h1>{t('registrationConfirmTitle')}</h1>
    <p>{t('registrationConfirmIntro')}</p>
    <strong>{state.user?.email}</strong>
    <p>{t('registrationConfirmHelp')}</p>
    <EmailVerificationBanner />
    <button type="button" onClick={() => setCurrentView('account')}>{t('registrationContinue')}</button>
  </main>;
};
export default RegistrationConfirmation;
