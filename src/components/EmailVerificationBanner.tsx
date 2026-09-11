import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useTranslation } from '../hooks/useTranslation';

const EmailVerificationBanner = () => {
  const { state, sendEmailVerification } = useApp();
  const { t } = useTranslation(state.language);
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'wait' | 'unavailable'>('idle');
  if (!state.user || state.user.emailVerified) return null;
  const send = async () => {
    setStatus('sending');
    try { const result = await sendEmailVerification(); setStatus(result.status === 'sent' ? 'sent' : result.status === 'wait' ? 'wait' : 'unavailable'); }
    catch { setStatus('unavailable'); }
  };
  return <div className="email-verification-banner" role="status"><span>{status === 'sent' ? t('verificationEmailSent') : status === 'wait' ? t('verificationEmailWait') : status === 'unavailable' ? t('verificationEmailUnavailable') : t('verifyEmailNotice')}</span><button type="button" disabled={status === 'sending' || status === 'sent'} onClick={() => void send()}>{status === 'sending' ? t('sending') : t('resendVerification')}</button></div>;
};

export default EmailVerificationBanner;
