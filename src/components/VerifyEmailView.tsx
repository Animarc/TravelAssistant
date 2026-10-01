import { useEffect, useRef, useState } from 'react';
import { ApiError } from '../api/client';
import { sessionApi } from '../api/sessionApi';
const VerifyEmailView = () => {
  const [status, setStatus] = useState<'checking' | 'verified' | 'invalid' | 'unavailable'>('checking');
  const token = useRef(new URLSearchParams(window.location.search).get('token'));
  const request = useRef<ReturnType<typeof sessionApi.confirmEmail> | null>(null);
  const confirm = () => {
    request.current ??= sessionApi.confirmEmail(token.current!);
    return request.current;
  };
  useEffect(() => {
    let active = true;
    if (!token.current) { setStatus('invalid'); return; }
    const url = new URL(window.location.href); url.searchParams.delete('token');
    window.history.replaceState(window.history.state, '', url);
    // Reuse the request when StrictMode runs this effect again.
    request.current ??= sessionApi.confirmEmail(token.current);
    void request.current.then(() => { if (active) setStatus('verified'); }).catch(reason => { if (active) setStatus(reason instanceof ApiError && reason.status === 400 ? 'invalid' : 'unavailable'); });
    return () => { active = false; };
  }, []);
  const retry = () => { request.current = null; setStatus('checking'); void confirm().then(() => setStatus('verified')).catch(reason => setStatus(reason instanceof ApiError && reason.status === 400 ? 'invalid' : 'unavailable')); };
  return <main className="verify-email-view"><img src={`${import.meta.env.BASE_URL}tabiji-log-mark.svg`} alt="" />
    <h1>{status === 'checking' ? 'Confirmando tu correo…' : status === 'verified' ? 'Correo confirmado' : status === 'unavailable' ? 'No hemos podido conectar' : 'Enlace no válido'}</h1>
    <p>{status === 'checking' ? 'Solo tardará un momento.' : status === 'verified' ? 'Tu correo ya está verificado. Puedes continuar a Tabiji Log.' : status === 'unavailable' ? 'Inténtalo de nuevo en unos momentos.' : 'El enlace ha caducado o ya fue utilizado. Inicia sesión para solicitar uno nuevo.'}</p>
    {status === 'unavailable' && <button type="button" onClick={retry}>Reintentar</button>}
    {status !== 'checking' && <a href={import.meta.env.BASE_URL}>Continuar a Tabiji Log</a>}</main>;
};
export default VerifyEmailView;