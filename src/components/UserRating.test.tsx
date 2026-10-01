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

it('translates an existing save error without reloading or discarding the draft', async () => {
  vi.mocked(travelsApi.getUserRating).mockResolvedValue({ userId: 'user', averageRating: 4, ratingCount: 1, userRating: null, userReview: null, canRate: true, reviews: [] });
  vi.mocked(travelsApi.rateUser).mockRejectedValue(new Error('failure'));
  const view = render(<UserRating {...props} />);
  await userEvent.click(await screen.findByRole('button', { name: '5 estrellas' }));
  await userEvent.type(screen.getByRole('textbox'), 'Great companion');
  await userEvent.click(screen.getByRole('button', { name: /publicar/i }));
  await screen.findByRole('alert');
  view.rerender(<UserRating {...props} language="ja" />);
  expect(screen.getByRole('alert')).toHaveTextContent(/[\u3040-\u30ff\u3400-\u9fff]/);
  expect(screen.getByRole('button', { name: '評価を投稿' })).toBeInTheDocument();
  expect(screen.getByRole('textbox')).toHaveValue('Great companion');
  expect(travelsApi.getUserRating).toHaveBeenCalledTimes(1);
});
