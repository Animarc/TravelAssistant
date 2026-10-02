import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, it, vi } from 'vitest';
import RatingModeration from './RatingModeration';
import { travelsApi } from '../api/travelsApi';
vi.mock('../api/travelsApi', () => ({ travelsApi: { ratingReports: vi.fn(), resolveRatingReport: vi.fn() } }));
afterEach(() => { cleanup(); vi.resetAllMocks(); });
const report = { id: 'one', kind: 'trip' as const, tripId: 'trip', ratedUserId: '', authorUsername: 'someone', score: 1, review: 'Bad text', reason: 'Insults', status: 'pending' as const, createdAt: '2026-10-02T10:00:00Z' };
it('requires confirmation before removing and displays replacement-content feedback', async () => {
  vi.mocked(travelsApi.ratingReports).mockResolvedValue([report]);
  vi.mocked(travelsApi.resolveRatingReport).mockResolvedValue({ ...report, status: 'changed' });
  render(<RatingModeration language="es" />);
  await userEvent.click(await screen.findByRole('button', { name: 'Retirar valoración' }));
  expect(travelsApi.resolveRatingReport).not.toHaveBeenCalled();
  await userEvent.click(screen.getByRole('button', { name: 'Retirar valoración' }));
  expect(travelsApi.resolveRatingReport).toHaveBeenCalledWith('one', true);
  expect(await screen.findByText(/no se ha retirado el nuevo contenido/)).toBeInTheDocument();
  expect(screen.queryByText('Bad text')).not.toBeInTheDocument();
});
it('keeps a report available when moderation fails', async () => {
  vi.mocked(travelsApi.ratingReports).mockResolvedValue([report]);
  vi.mocked(travelsApi.resolveRatingReport).mockRejectedValue(new Error('failed'));
  render(<RatingModeration language="ja" />);
  const dismiss = await screen.findByRole('button', { name: '対応不要とする' });
  await userEvent.click(dismiss);
  expect(await screen.findByRole('alert')).toBeInTheDocument();
  expect(screen.getByText('Bad text')).toBeInTheDocument();
  expect(dismiss).toBeEnabled();
});
