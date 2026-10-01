import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import PasswordResetView from './PasswordResetView';
import { sessionApi } from '../api/sessionApi';
import { ApiError } from '../api/client';
vi.mock('../context/AppContext', () => ({ useApp: () => ({ state: { language: 'es' } }) }));
vi.mock('../api/sessionApi', () => ({ sessionApi: { requestPasswordReset: vi.fn(), resetPassword: vi.fn() } }));
beforeEach(() => window.history.replaceState({}, '', '/?reset-password=1&token=secret'));
afterEach(() => { cleanup(); vi.resetAllMocks(); window.history.replaceState({}, '', '/'); });
it('requests recovery and shows a response that does not reveal account existence', async () => {
  vi.mocked(sessionApi.requestPasswordReset).mockResolvedValue({ status: 'accepted' });
  render(<PasswordResetView />);
  await userEvent.type(screen.getByLabelText(/correo electrónico/i), 'ana@example.com');
  await userEvent.click(screen.getByRole('button', { name: 'Enviar enlace' }));
  expect(sessionApi.requestPasswordReset).toHaveBeenCalledWith('ana@example.com');
  expect(await screen.findByRole('status')).toHaveTextContent('Si existe una cuenta');
});
it('does not submit mismatched passwords', async () => {
  render(<PasswordResetView confirm />);
  await userEvent.type(screen.getByLabelText('Nueva contraseña'), 'Password-123');
  await userEvent.type(screen.getByLabelText('Repite la contraseña'), 'Different-456');
  await userEvent.click(screen.getByRole('button', { name: 'Cambiar contraseña' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('no coinciden');
  expect(sessionApi.resetPassword).not.toHaveBeenCalled();
});
it('changes the password and removes the reset credential from the address', async () => {
  vi.mocked(sessionApi.resetPassword).mockResolvedValue({ status: 'reset' });
  render(<PasswordResetView confirm />);
  await userEvent.type(screen.getByLabelText('Nueva contraseña'), 'Password-123');
  await userEvent.type(screen.getByLabelText('Repite la contraseña'), 'Password-123');
  await userEvent.click(screen.getByRole('button', { name: 'Cambiar contraseña' }));
  expect(await screen.findByText('Contraseña actualizada')).toBeInTheDocument();
  expect(sessionApi.resetPassword).toHaveBeenCalledWith('secret', 'Password-123');
  expect(window.location.search).not.toContain('secret');
});
it('offers a new link when the token is expired', async () => {
  vi.mocked(sessionApi.resetPassword).mockRejectedValue(new ApiError(400, 'request.failed'));
  render(<PasswordResetView confirm />);
  await userEvent.type(screen.getByLabelText('Nueva contraseña'), 'Password-123');
  await userEvent.type(screen.getByLabelText('Repite la contraseña'), 'Password-123');
  await userEvent.click(screen.getByRole('button', { name: 'Cambiar contraseña' }));
  expect(await screen.findByRole('link', { name: 'Solicitar otro enlace' })).toBeInTheDocument();
});
