import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { apiRequest } from './client';
vi.mock('./client', () => ({ apiRequest: vi.fn(), SESSION_API_URL: 'https://auth.tabijilog.com' }));
beforeEach(() => {
  vi.resetModules();
  vi.stubEnv('VITE_GOOGLE_CLIENT_ID', 'client.apps.googleusercontent.com');
  vi.mocked(apiRequest).mockResolvedValue({ nonce: 'fresh-nonce', state: 'state' });
});
afterEach(() => { document.querySelectorAll('script').forEach(script => script.remove()); vi.clearAllMocks(); vi.unstubAllEnvs(); vi.unstubAllGlobals(); });

it('waits for the SDK, shares loading and renders the official popup button with the server nonce', async () => {
  const initialize = vi.fn(), renderButton = vi.fn();
  vi.stubGlobal('google', { accounts: { id: { initialize, renderButton } } });
  const { prepareGoogleButton } = await import('./socialAuth');
  const first = prepareGoogleButton(), second = prepareGoogleButton();
  expect(document.querySelectorAll('script')).toHaveLength(1);
  expect(apiRequest).not.toHaveBeenCalled();
  document.querySelector('script')!.dispatchEvent(new Event('load'));
  const [render] = await Promise.all([first, second]);
  const credential = vi.fn(), click = vi.fn(), element = document.createElement('div');
  render(element, 'ja', credential, click);
  expect(initialize).toHaveBeenCalledWith(expect.objectContaining({ nonce: 'fresh-nonce', ux_mode: 'popup', client_id: 'client.apps.googleusercontent.com' }));
  expect(renderButton).toHaveBeenCalledWith(element, expect.objectContaining({ locale: 'ja', text: 'continue_with', click_listener: click }));
  initialize.mock.calls[0][0].callback({ credential: 'signed-token' });
  expect(credential).toHaveBeenCalledWith('signed-token');
});
it('allows retrying when loading the Google library fails', async () => {
  const { prepareGoogleButton } = await import('./socialAuth');
  const first = prepareGoogleButton();
  document.querySelector('script')!.dispatchEvent(new Event('error'));
  await expect(first).rejects.toThrow('social_sdk_unavailable');
  vi.stubGlobal('google', { accounts: { id: { initialize: vi.fn(), renderButton: vi.fn() } } });
  const retry = prepareGoogleButton();
  expect(document.querySelectorAll('script')).toHaveLength(1);
  document.querySelector('script')!.dispatchEvent(new Event('load'));
  await expect(retry).resolves.toBeTypeOf('function');
});
