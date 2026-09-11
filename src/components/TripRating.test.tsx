import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, it, vi } from 'vitest';
import TripRating from './TripRating';
import { travelsApi } from '../api/travelsApi';

vi.mock('../api/travelsApi', () => ({ travelsApi: { getTripRating: vi.fn(), rateTrip: vi.fn() } }));
afterEach(() => { cleanup(); vi.clearAllMocks(); });

it('loads the current vote and updates the aggregate after rating', async () => {
  vi.mocked(travelsApi.getTripRating).mockResolvedValue({ averageRating: 4, ratingCount: 2, userRating: null, canRate: true });
  vi.mocked(travelsApi.rateTrip).mockResolvedValue({ averageRating: 4.3, ratingCount: 3, userRating: 5, canRate: true });
  render(<TripRating tripId="trip-1" authenticated language="es" />);
  const fiveStars = await screen.findByRole('button', { name: '5 estrellas' });
  await userEvent.click(fiveStars);
  expect(travelsApi.rateTrip).toHaveBeenCalledWith('trip-1', 5);
  expect(await screen.findByText('4.3')).toBeInTheDocument();
  expect(fiveStars).toHaveAttribute('aria-pressed', 'true');
});
