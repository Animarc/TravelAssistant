import { apiRequest, SESSION_API_URL } from './client';

const challenge = (provider: 'google' | 'apple', signal?: AbortSignal) =>
  apiRequest<{ nonce: string; state: string }>(SESSION_API_URL, `/api/auth/browser/challenge/${provider}`, { method: 'POST', signal }, false);


const scripts = new Map<string, Promise<void>>();
const loadScript = (src: string): Promise<void> => {
  const pending = scripts.get(src);
  if (pending) return pending;
  const promise = new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src; script.async = true;
    script.onload = () => resolve();
    script.onerror = () => { scripts.delete(src); script.remove(); reject(new Error('social_sdk_unavailable')); };
    document.head.appendChild(script);
  });
  scripts.set(src, promise);
  return promise;
};

type GoogleIdentity = {
  initialize: (options: { client_id: string; nonce: string; callback: (response: { credential: string }) => void; auto_select: boolean; ux_mode: 'popup' }) => void;
  renderButton: (element: HTMLElement, options: { type: 'standard'; theme: 'outline' | 'outline_dark'; size: 'large'; text: 'continue_with'; shape: 'pill'; locale: string; width: number; click_listener: () => void }) => void;
};

export const prepareGoogleButton = async (signal?: AbortSignal) => {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  if (!clientId) throw new Error('social.google_unavailable');
  await loadScript('https://accounts.google.com/gsi/client');
  signal?.throwIfAborted();
  const google = (window as unknown as { google?: { accounts: { id: GoogleIdentity } } }).google?.accounts.id;
  if (!google) throw new Error('social.google_unavailable');
  const { nonce } = await challenge('google', signal);
  return (element: HTMLElement, language: string, onCredential: (credential: string) => void, onClick: () => void, appearance: 'light' | 'dark' = 'light') => {
    google.initialize({ client_id: clientId, nonce, callback: response => onCredential(response.credential), auto_select: false, ux_mode: 'popup' });
    google.renderButton(element, { type: 'standard', theme: appearance === 'dark' ? 'outline_dark' : 'outline', size: 'large', text: 'continue_with', shape: 'pill', locale: language, width: Math.max(200, Math.min(400, element.parentElement?.clientWidth || 240)), click_listener: onClick });
  };
};

export const requestAppleCredential = async (): Promise<{ idToken: string; firstName?: string; lastName?: string }> => {
  const clientId = import.meta.env.VITE_APPLE_CLIENT_ID;
  if (!clientId) throw new Error('social.apple_unavailable');
  await loadScript('https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js');
  const apple = (window as unknown as { AppleID?: { auth: { init: (options: object) => void; signIn: () => Promise<{ authorization: { id_token: string; state: string }; user?: { name?: { firstName?: string; lastName?: string } } }> } } }).AppleID;
  if (!apple) throw new Error('social.apple_unavailable');
  const { nonce, state } = await challenge('apple');
  apple.auth.init({ clientId, nonce, state, scope: 'name email', redirectURI: import.meta.env.VITE_APPLE_REDIRECT_URI ?? window.location.href, usePopup: true });
  const result = await apple.auth.signIn();
  if (result.authorization.state !== state) throw new Error('social.apple_cancelled');
  return { idToken: result.authorization.id_token, firstName: result.user?.name?.firstName, lastName: result.user?.name?.lastName };
};
