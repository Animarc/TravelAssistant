import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, it, vi } from 'vitest';
import RegistrationConfirmation from './RegistrationConfirmation';
const setCurrentView = vi.fn();
const sendEmailVerification = vi.fn();
vi.mock('../context/AppContext', () => ({ useApp: () => ({
  state: { language: 'es', user: { email: 'test@example.com', emailVerified: false } },
  setCurrentView, sendEmailVerification
}) }));
afterEach(() => { cleanup(); vi.clearAllMocks(); });
it('shows the destination email and lets a new user request another message', async () => {
  sendEmailVerification.mockResolvedValue({ verified: false, status: 'sent' });
  render(<RegistrationConfirmation />);
  expect(screen.getByRole('heading', { name: 'Confirma tu correo' })).toBeInTheDocument();
  expect(screen.getByText('test@example.com')).toBeInTheDocument();
  await userEvent.click(screen.getByRole('button', { name: /reenviar/i }));
  expect(sendEmailVerification).toHaveBeenCalledOnce();
  await userEvent.click(screen.getByRole('button', { name: 'Continuar a mi cuenta' }));
  expect(setCurrentView).toHaveBeenCalledWith('account');
});
