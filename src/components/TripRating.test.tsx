import { act, cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, it, vi } from 'vitest';
import TripRating from './TripRating';
import { travelsApi } from '../api/travelsApi';

vi.mock('../api/travelsApi', () => ({ travelsApi: { getTripRating: vi.fn(), rateTrip: vi.fn(), deleteTripRating: vi.fn(), reportRating: vi.fn() } }));
afterEach(() => { cleanup(); vi.clearAllMocks(); });

it('loads the current vote and updates the aggregate after rating', async () => {
  vi.mocked(travelsApi.getTripRating).mockResolvedValue({ averageRating: 4, ratingCount: 2, userRating: null, userReview: null, canRate: true, reviews: [] });
  vi.mocked(travelsApi.rateTrip).mockResolvedValue({ averageRating: 4.3, ratingCount: 3, userRating: 5, userReview: null, canRate: true, reviews: [] });
  render(<TripRating tripId="trip-1" authenticated language="es" />);
  const fiveStars = await screen.findByRole('button', { name: '5 estrellas' });
  await userEvent.click(fiveStars);
  expect(travelsApi.rateTrip).toHaveBeenCalledWith('trip-1', 5, undefined);
  expect(await screen.findByText('4.3')).toBeInTheDocument();
  expect(fiveStars).toHaveAttribute('aria-pressed', 'true');
});

const own = { averageRating: 4, ratingCount: 1, userRating: 4, userReview: 'My opinion', canRate: true, reviews: [] };
it('requires confirmation to delete the current user rating', async () => {
  vi.mocked(travelsApi.getTripRating).mockResolvedValue(own);
  vi.mocked(travelsApi.deleteTripRating).mockResolvedValue({ ...own, averageRating: 0, ratingCount: 0, userRating: null, userReview: null });
  render(<TripRating tripId="trip-1" authenticated language="es" expanded />);
  await userEvent.click(await screen.findByRole('button', { name: 'Eliminar mi valoración' }));
  expect(travelsApi.deleteTripRating).not.toHaveBeenCalled();
  await userEvent.click(screen.getByRole('button', { name: 'Eliminar' }));
  expect(travelsApi.deleteTripRating).toHaveBeenCalledWith('trip-1');
  expect(await screen.findByText('Valoración eliminada.')).toBeInTheDocument();
  expect(screen.getByRole('textbox')).toHaveValue('');
});
it('reports another review with a reason and hides reporting on own reviews', async () => {
  vi.mocked(travelsApi.getTripRating).mockResolvedValue({ ...own, reviews: [
    { username: 'me', authorId: 'me', isOwn: true, score: 4, review: 'My review', updatedAt: '2026-10-02' },
    { username: 'other', authorId: 'other', isOwn: false, score: 1, review: 'Abusive review', updatedAt: '2026-10-02' }
  ] });
  vi.mocked(travelsApi.reportRating).mockResolvedValue({ id: 'report' } as Awaited<ReturnType<typeof travelsApi.reportRating>>);
  render(<TripRating tripId="trip-1" authenticated language="es" expanded />);
  expect(await screen.findAllByRole('button', { name: 'Denunciar reseña' })).toHaveLength(1);
  await userEvent.click(screen.getByRole('button', { name: 'Denunciar reseña' }));
  await userEvent.type(screen.getByRole('textbox', { name: 'Motivo de la denuncia' }), 'Insultos');
  await userEvent.click(screen.getByRole('button', { name: 'Enviar denuncia' }));
  expect(travelsApi.reportRating).toHaveBeenCalledWith({ kind: 'trip', tripId: 'trip-1', ratedUserId: undefined, authorId: 'other', reason: 'Insultos' });
  expect(await screen.findByText('Denuncia enviada. Gracias por avisar.')).toBeInTheDocument();
});
it('does not apply an old trip save result after switching trips', async () => {
  vi.mocked(travelsApi.getTripRating).mockResolvedValue(own);
  let complete!: (value: typeof own) => void;
  vi.mocked(travelsApi.rateTrip).mockImplementation(() => new Promise(resolve => { complete = resolve; }));
  const view = render(<TripRating tripId="old" authenticated language="es" />);
  await userEvent.click(await screen.findByRole('button', { name: '5 estrellas' }));
  vi.mocked(travelsApi.getTripRating).mockResolvedValue({ ...own, averageRating: 2, userRating: 2 });
  view.rerender(<TripRating tripId="new" authenticated language="es" />);
  await screen.findByText('2.0');
  await act(async () => complete({ ...own, averageRating: 5, userRating: 5 }));
  expect(screen.getByText('2.0')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: '2 estrellas' })).toHaveAttribute('aria-pressed', 'true');
});
