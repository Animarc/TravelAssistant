import { expect, it, vi } from 'vitest';
import { travelsApi } from './travelsApi';
import { apiRequest } from './client';
vi.mock('./client', () => ({ TRAVELS_API_URL: 'http://test', apiRequest: vi.fn().mockResolvedValue({}) }));
it('preserves existing review on a star-only update and permits explicit clearing', async () => {
  await travelsApi.rateTrip('trip', 5);
  expect(JSON.parse(vi.mocked(apiRequest).mock.calls[vi.mocked(apiRequest).mock.calls.length - 1][2]!.body as string)).toEqual({ score: 5, review: null, preserveReview: true });
  await travelsApi.rateTrip('trip', 4, '');
  expect(JSON.parse(vi.mocked(apiRequest).mock.calls[vi.mocked(apiRequest).mock.calls.length - 1][2]!.body as string)).toEqual({ score: 4, review: null, preserveReview: false });
});
