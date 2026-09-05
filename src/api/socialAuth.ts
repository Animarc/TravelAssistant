import { apiRequest, SESSION_API_URL } from './client';

const challenge = (provider: 'google' | 'apple') =>
  apiRequest<{ nonce: string; state: string }>(SESSION_API_URL, `/api/auth/browser/challenge/${provider}`, { method: 'POST' }, false);

const loadScript = (src: string) => new Promise<void>((resolve, reject) => {
  const existing = document.querySelector(`script[src="${src}"]`);
  if (existing) { resolve(); return; }
  const script = document.createElement('script'); script.src = src; script.async = true; script.onload = () => resolve(); script.onerror = () => reject(new Error('social_sdk_unavailable')); document.head.appendChild(script);
});

export const requestGoogleCredential = async (): Promise<string> => {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  if (!clientId) throw new Error('social.google_unavailable');
  await loadScript('https://accounts.google.com/gsi/client');
  const { nonce } = await challenge('google');
  return new Promise((resolve, reject) => {
    const google = (window as unknown as { google?: { accounts: { id: { initialize: (options: object) => void; prompt: (callback: (event: { isNotDisplayed: () => boolean; isSkippedMoment: () => boolean }) => void) => void } } } }).google;
    if (!google) { reject(new Error('social.google_unavailable')); return; }
    google.accounts.id.initialize({ client_id: clientId, nonce, callback: (response: { credential: string }) => resolve(response.credential), auto_select: false });
    google.accounts.id.prompt(event => { if (event.isNotDisplayed() || event.isSkippedMoment()) reject(new Error('social.google_cancelled')); });
  });
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
