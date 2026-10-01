import { StrictMode } from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, it, vi } from 'vitest';
import { ApiError } from '../api/client';
import { sessionApi } from '../api/sessionApi';
import VerifyEmailView from './VerifyEmailView';
vi.mock('../api/sessionApi', () => ({ sessionApi: { confirmEmail: vi.fn() } }));
afterEach(() => { cleanup(); vi.resetAllMocks(); window.history.replaceState({}, '', '/'); });
it('confirms only once in StrictMode and removes the token from the URL', async () => {
  window.history.replaceState({}, '', '/?verify-email=1&token=secret');
  vi.mocked(sessionApi.confirmEmail).mockResolvedValue({ verified: true, status: 'verified' });
  render(<StrictMode><VerifyEmailView /></StrictMode>);
  expect(await screen.findByText('Correo confirmado')).toBeInTheDocument();
  expect(sessionApi.confirmEmail).toHaveBeenCalledTimes(1);
  expect(sessionApi.confirmEmail).toHaveBeenCalledWith('secret');
  expect(window.location.search).not.toContain('secret');
});
it('lets the user retry a network failure without treating it as an expired link', async () => {
  window.history.replaceState({}, '', '/?verify-email=1&token=secret');
  vi.mocked(sessionApi.confirmEmail).mockRejectedValueOnce(new ApiError(0, 'network.unavailable')).mockResolvedValueOnce({ verified: true, status: 'verified' });
  render(<VerifyEmailView />);
  await userEvent.click(await screen.findByRole('button', { name: 'Reintentar' }));
  expect(await screen.findByText('Correo confirmado')).toBeInTheDocument();
});
it('rejects an expired link', async () => {
  window.history.replaceState({}, '', '/?verify-email=1&token=expired');
  vi.mocked(sessionApi.confirmEmail).mockRejectedValue(new ApiError(400, 'request.failed'));
  render(<VerifyEmailView />);
  expect(await screen.findByText('Enlace no válido')).toBeInTheDocument();
});