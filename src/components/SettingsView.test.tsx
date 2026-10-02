import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, it, vi } from 'vitest';
import SettingsView from './SettingsView';
import { useApp } from '../context/AppContext';
import { sessionApi } from '../api/sessionApi';
vi.mock('../context/AppContext', () => ({ useApp: vi.fn() }));
vi.mock('../api/sessionApi', () => ({ sessionApi: { requestPasswordReset: vi.fn() } }));
const updateProfile = vi.fn();
const setup = () => { vi.mocked(useApp).mockReturnValue({ state: { language: 'es', user: { username: 'yui', email: 'yui@tabijilog.com', firstName: 'Yui' } }, updateProfile } as unknown as ReturnType<typeof useApp>); return render(<SettingsView />); };
afterEach(() => { cleanup(); vi.resetAllMocks(); });
it('edits profile and confirms successful saving', async () => {
  updateProfile.mockResolvedValue(undefined); setup();
  await userEvent.type(screen.getByRole('textbox', { name: 'Apellidos' }), ' Test');
  await userEvent.click(screen.getByRole('button', { name: 'Guardar perfil' }));
  expect(updateProfile).toHaveBeenCalledWith('Yui', 'Test'); expect(await screen.findByText('Perfil guardado.')).toBeInTheDocument();
});
it('requests a password reset for the signed-in account and prevents repeat sends', async () => {
  vi.mocked(sessionApi.requestPasswordReset).mockResolvedValue({ status: 'sent' }); setup();
  const button = screen.getByRole('button', { name: 'Enviar enlace' });
  await userEvent.click(button); expect(sessionApi.requestPasswordReset).toHaveBeenCalledWith('yui@tabijilog.com');
  expect(await screen.findByText(/Si tu cuenta tiene contraseña, recibirás/)).toBeInTheDocument(); expect(button).toBeDisabled();
});
it('lets the user retry after a reset request fails', async () => {
  vi.mocked(sessionApi.requestPasswordReset).mockRejectedValue(new Error('failed')); setup();
  const button = screen.getByRole('button', { name: 'Enviar enlace' }); await userEvent.click(button);
  expect(await screen.findByRole('alert')).toBeInTheDocument(); expect(button).toBeEnabled();
});
