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
it('keeps discovery visible alongside saved trips and filters the library', async () => {
  setup();
  expect(screen.getByText('Public trip discovery')).toBeInTheDocument();
  await userEvent.type(screen.getByRole('searchbox'), 'Okinawa');
  expect(screen.queryByRole('heading', { name: 'Islandia' })).not.toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'Okinawa' })).toBeInTheDocument();
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
