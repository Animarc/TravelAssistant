import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, it, vi } from 'vitest';
import AccountView from './AccountView';
import { useApp } from '../context/AppContext';
vi.mock('../context/AppContext', () => ({ useApp: vi.fn() }));
vi.mock('./PublicTripsExplorer', () => ({ default: () => <div>Public trip discovery</div> }));
vi.mock('./UserSearch', () => ({ default: () => <div>People search</div> }));
const switchTrip = vi.fn();
const setCurrentView = vi.fn();
const loadCollaboration = vi.fn();
const trip = (id: string, tripName: string) => ({ id, tripName, days: [], currentUserRole: 'owner', capabilities: { canManageMembers: true, canDelete: true } });
const context = {
  state: { language: 'es', isAuthenticated: true, user: { userId: 'user', username: 'yui', email: 'yui@example.com' }, activeTripId: 'one', trips: [trip('one', 'Islandia'), trip('two', 'Okinawa')] },
  members: [{ userId: 'user', username: 'yui', role: 'owner', ratingCount: 0 }], invitations: [], switchTrip, setCurrentView, loadCollaboration
};
const setup = () => { vi.mocked(useApp).mockReturnValue(context as unknown as ReturnType<typeof useApp>); return render(<AccountView />); };
afterEach(() => { cleanup(); vi.clearAllMocks(); });
it('filters saved trips and opens discovery from the account menu', async () => {
  setup();
  expect(screen.queryByText('Public trip discovery')).not.toBeInTheDocument();
  await userEvent.type(screen.getByRole('searchbox'), 'Okinawa');
  expect(screen.queryByRole('heading', { name: 'Islandia' })).not.toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'Okinawa' })).toBeInTheDocument();
  await userEvent.click(screen.getByRole('button', { name: 'Explorar' }));
  expect(screen.getByText('Public trip discovery')).toBeInTheDocument();
  expect(screen.queryByRole('searchbox')).not.toBeInTheDocument();
  await userEvent.click(screen.getByRole('button', { name: /Mis Viajes/ }));
  expect(screen.getByRole('searchbox')).toHaveValue('Okinawa');
});
it('places access inside its trip and keeps switching access on the account screen', async () => {
  setup();
  const first = screen.getByRole('heading', { name: 'Islandia' }).closest('article')!;
  await userEvent.click(within(first).getByRole('button', { name: 'Personas con acceso' }));
  expect(within(first).getByRole('region', { name: 'Personas con acceso: Islandia' })).toBeInTheDocument();
  const second = screen.getByRole('heading', { name: 'Okinawa' }).closest('article')!;
  await userEvent.click(within(second).getByRole('button', { name: 'Personas con acceso' }));
  expect(switchTrip).toHaveBeenLastCalledWith('two');
  expect(setCurrentView).toHaveBeenLastCalledWith('account');
  expect(within(first).queryByRole('region')).not.toBeInTheDocument();
});

it('separates profile, creation and invitations into their own sections', async () => {
  setup();
  expect(screen.queryByRole('button', { name: 'Guardar perfil' })).not.toBeInTheDocument();
  await userEvent.click(screen.getByRole('button', { name: 'Mi perfil' }));
  expect(screen.getByRole('button', { name: 'Guardar perfil' })).toBeInTheDocument();
  await userEvent.click(screen.getByRole('button', { name: 'Nuevo viaje' }));
  expect(screen.getByRole('button', { name: 'Crear viaje' })).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Guardar perfil' })).not.toBeInTheDocument();
  await userEvent.click(screen.getByRole('button', { name: 'Invitaciones' }));
  expect(screen.getByText('No tienes invitaciones pendientes.')).toBeInTheDocument();
});