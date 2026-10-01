import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import GoogleSignInButton from './GoogleSignInButton';
import { prepareGoogleButton } from '../api/socialAuth';
vi.mock('../api/socialAuth', () => ({ prepareGoogleButton: vi.fn() }));
afterEach(() => { cleanup(); vi.resetAllMocks(); });
it('reports a rejected credential and lets the user retry with a fresh challenge', async () => {
  const googleRender = vi.fn();
  vi.mocked(prepareGoogleButton).mockResolvedValue(googleRender);
  const login = vi.fn().mockRejectedValue(new Error('invalid credential')), error = vi.fn();
  render(<GoogleSignInButton language="es" onCredential={login} onError={error} />);
  await waitFor(() => expect(googleRender).toHaveBeenCalledOnce());
  await act(async () => googleRender.mock.calls[0][2]('credential'));
  expect(login).toHaveBeenCalledWith('credential');
  expect(error).toHaveBeenCalledOnce();
  fireEvent.click(screen.getByRole('button', { name: 'Continuar con Google' }));
  await waitFor(() => expect(prepareGoogleButton).toHaveBeenCalledTimes(2));
});
it('does not initialize Google after the view was unmounted', async () => {
  let resolve!: (value: Awaited<ReturnType<typeof prepareGoogleButton>>) => void;
  vi.mocked(prepareGoogleButton).mockReturnValue(new Promise(done => { resolve = done; }));
  const googleRender = vi.fn();
  const view = render(<GoogleSignInButton language="es" onCredential={vi.fn()} onError={vi.fn()} />);
  view.unmount();
  await act(async () => resolve(googleRender));
  expect(googleRender).not.toHaveBeenCalled();
});
