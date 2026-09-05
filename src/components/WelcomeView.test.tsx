import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import WelcomeView from './WelcomeView';

const login = vi.fn();
const register = vi.fn();

vi.mock('../context/AppContext', () => ({
  useApp: () => ({
    state: { language: 'es', authLoading: false, error: null },
    login,
    register
  })
}));

describe('WelcomeView', () => {
  beforeEach(() => vi.clearAllMocks());

  it('starts with the conventional login form', () => {
    render(<WelcomeView />);
    expect(screen.getByRole('heading', { name: /planifica el viaje/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/^nombre$/i)).not.toBeInTheDocument();
  });

  it('switches to registration and submits the complete identity', async () => {
    register.mockResolvedValue(undefined);
    render(<WelcomeView />);
    fireEvent.click(screen.getByRole('tab', { name: /crear cuenta/i }));
    fireEvent.change(screen.getByLabelText(/^nombre$/i), { target: { value: 'Marc' } });
    fireEvent.change(screen.getByLabelText(/apellidos/i), { target: { value: 'Viajero' } });
    fireEvent.change(screen.getByLabelText(/correo electrónico/i), { target: { value: 'marc@example.com' } });
    fireEvent.change(screen.getByLabelText(/contraseña/i), { target: { value: 'Password!123' } });
    fireEvent.click(screen.getByRole('button', { name: /crear cuenta/i }));
    expect(register).toHaveBeenCalledWith('marc@example.com', 'Password!123', 'Marc', 'Viajero');
  });
});
