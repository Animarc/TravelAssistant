import { act, renderHook, waitFor } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { expect, it, vi } from 'vitest';
import type { ReactNode } from 'react';
import { useTripState } from './useTripState';

vi.mock('../api/travelsApi', () => ({ travelsApi: { listTrips: vi.fn().mockResolvedValue([]), getTrip: vi.fn() } }));
const run = async (operation: () => Promise<void>) => { await operation(); };
it('keeps the direct settings route even when the account has no trips', async () => {
  const wrapper = ({ children }: { children: ReactNode }) => <MemoryRouter initialEntries={['/settings']}>{children}</MemoryRouter>;
  const { result } = renderHook(() => useTripState(run), { wrapper });
  await waitFor(() => expect(result.current.store.currentView).toBe('settings'));
  await act(async () => result.current.loadRemoteTrips());
  expect(result.current.store.currentView).toBe('settings');
  expect(result.current.store.lastTripView).toBe('planning');
});
it('preserves the last trip section while visiting settings', async () => {
  const wrapper = ({ children }: { children: ReactNode }) => <MemoryRouter initialEntries={['/budget']}>{children}</MemoryRouter>;
  const { result } = renderHook(() => useTripState(run), { wrapper });
  await waitFor(() => expect(result.current.store.currentView).toBe('budget'));
  act(() => result.current.setCurrentView('settings'));
  await waitFor(() => expect(result.current.store.currentView).toBe('settings'));
  expect(result.current.store.lastTripView).toBe('budget');
  act(() => result.current.setCurrentView(result.current.store.lastTripView));
  await waitFor(() => expect(result.current.store.currentView).toBe('budget'));
});

it('recognises the trailing slash added by static hosting to app routes', async () => {
  const wrapper = ({ children }: { children: ReactNode }) => <MemoryRouter initialEntries={['/settings/']}>{children}</MemoryRouter>;
  const { result } = renderHook(() => useTripState(run), { wrapper });
  await waitFor(() => expect(result.current.store.currentView).toBe('settings'));
});
it('leaves a localised landing for the account centre after loading an empty account', async () => {
  const wrapper = ({ children }: { children: ReactNode }) => <MemoryRouter initialEntries={['/ja/']}>{children}</MemoryRouter>;
  const { result } = renderHook(() => ({ trips: useTripState(run), location: useLocation() }), { wrapper });
  await act(async () => result.current.trips.loadRemoteTrips());
  expect(result.current.location.pathname).toBe('/account');
});
