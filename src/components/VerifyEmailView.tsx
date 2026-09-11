import { useEffect, useState } from 'react';
import { sessionApi } from '../api/sessionApi';

const VerifyEmailView = () => {
  const [status, setStatus] = useState<'checking' | 'verified' | 'invalid'>('checking');
  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get('token');
    if (!token) { setStatus('invalid'); return; }
    void sessionApi.confirmEmail(token).then(() => setStatus('verified')).catch(() => setStatus('invalid'));
  }, []);
  return <main className="verify-email-view"><img src={`${import.meta.env.BASE_URL}tabiji-log-mark.svg`} alt="" /><h1>{status === 'checking' ? 'Confirmando tu correo…' : status === 'verified' ? 'Correo confirmado' : 'Enlace no válido'}</h1><p>{status === 'checking' ? 'Solo tardará un momento.' : status === 'verified' ? 'Tu cuenta ya tiene todas las funciones activadas.' : 'El enlace ha caducado o ya fue utilizado. Inicia sesión para solicitar uno nuevo.'}</p>{status !== 'checking' && <a href={import.meta.env.BASE_URL}>{status === 'verified' ? 'Continuar a Tabiji Log' : 'Volver al inicio'}</a>}</main>;
};

export default VerifyEmailView;
