import { cleanup, render, screen, within } from '@testing-library/react';
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
  await userEvent.click(screen.getByRole('button', { name: 'Centro de viajes' }));
  expect(setCurrentView).toHaveBeenCalledWith('account');
  expect(screen.queryByRole('button', { name: 'Opciones' })).not.toBeInTheDocument();
  vi.mocked(useApp).mockReturnValue(context('account') as unknown as ReturnType<typeof useApp>);
  rerender(<Navbar />);
  expect(screen.getByRole('button', { name: 'Centro de viajes' })).toHaveAttribute('aria-current', 'page');
  expect(screen.getByRole('button', { name: 'Centro de viajes' }).closest('.navbar-trip-controls')).not.toBeNull();
  expect(screen.queryByRole('button', { name: 'Volver al viaje' })).not.toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Tabiji Log' })).toHaveAttribute('href', '/');
});
it('keeps the trip selector beside the center entry and opens a selected trip from the center', async () => {
  const switchTrip = vi.fn();
  const value = context('account');
  vi.mocked(useApp).mockReturnValue({ ...value, switchTrip, state: { ...value.state, activeTripId: 'one', tripName: 'Okinawa', trips: [{ id: 'one', tripName: 'Okinawa', days: [], travelers: [] }] } } as unknown as ReturnType<typeof useApp>);
  render(<Navbar />);
  const controls = screen.getByRole('button', { name: 'Centro de viajes' }).closest('.navbar-trip-controls')!;
  await userEvent.click(within(controls as HTMLElement).getByRole('button', { name: 'Cambiar de viaje' }));
  await userEvent.click(screen.getByRole('option', { name: /Okinawa/ }));
  expect(switchTrip).toHaveBeenCalledWith('one');
  expect(setCurrentView).toHaveBeenCalledWith('planning');
  expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
});