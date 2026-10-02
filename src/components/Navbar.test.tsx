import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, it, vi } from 'vitest';
import Navbar from './Navbar';
import { useApp } from '../context/AppContext';

vi.mock('../context/AppContext', () => ({ useApp: vi.fn() }));
vi.mock('./ThemePicker', () => ({ default: () => null }));
const setCurrentView = vi.fn();
const context = (currentView: 'planning' | 'account') => ({
  state: { language: 'es', currentView, lastTripView: 'planning', isAuthenticated: true, publicPreview: null, trips: [], tripName: '', days: [], accommodations: [] },
  saveStatus: 'idle', setCurrentView
});
afterEach(() => { cleanup(); vi.clearAllMocks(); });

it('offers a visible travel center entry from the trip and keeps it active on the account', async () => {
  vi.mocked(useApp).mockReturnValue(context('planning') as unknown as ReturnType<typeof useApp>);
  const { rerender } = render(<Navbar />);
  await userEvent.click(screen.getByRole('button', { name: 'Mis Viajes' }));
  expect(setCurrentView).toHaveBeenCalledWith('account');
  expect(screen.queryByRole('button', { name: 'Opciones' })).not.toBeInTheDocument();
  vi.mocked(useApp).mockReturnValue(context('account') as unknown as ReturnType<typeof useApp>);
  rerender(<Navbar />);
  expect(screen.getByRole('button', { name: 'Mis Viajes' })).toHaveAttribute('aria-current', 'page');
  expect(screen.getByText('Centro de viajes')).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Volver al viaje' })).not.toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Tabiji Log' })).toHaveAttribute('href', '/');
});