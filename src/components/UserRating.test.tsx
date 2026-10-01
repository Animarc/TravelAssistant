import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, it, vi } from 'vitest';
import UserRating from './UserRating';
import { travelsApi } from '../api/travelsApi';
vi.mock('../api/travelsApi', () => ({ travelsApi: { getUserRating: vi.fn(), rateUser: vi.fn() } }));
afterEach(() => { cleanup(); vi.resetAllMocks(); });
const props = { tripId: 'trip', userId: 'user', language: 'es' as const, initialAverage: 4, initialCount: 1 };
it('displays loading errors without unhandled rejections', async () => {
  vi.mocked(travelsApi.getUserRating).mockRejectedValue(new Error('failure'));
  render(<UserRating {...props} />);
  expect(await screen.findByRole('alert')).toBeInTheDocument();
});
it('keeps the draft when saving fails and displays an error', async () => {
  vi.mocked(travelsApi.getUserRating).mockResolvedValue({ userId: 'user', averageRating: 4, ratingCount: 1, userRating: null, userReview: null, canRate: true, reviews: [] });
  vi.mocked(travelsApi.rateUser).mockRejectedValue(new Error('failure'));
  render(<UserRating {...props} />);
  const button = await screen.findByRole('button', { name: '5 estrellas' });
  expect(button).toHaveTextContent('★');
  await userEvent.click(button);
  await userEvent.type(screen.getByRole('textbox'), 'Gran compañera');
  await userEvent.click(screen.getByRole('button', { name: /publicar/i }));
  expect(await screen.findByRole('alert')).toBeInTheDocument();
  expect(screen.getByRole('textbox')).toHaveValue('Gran compañera');
});
