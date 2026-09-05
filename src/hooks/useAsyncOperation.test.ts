import { describe, expect, it } from 'vitest';
import { ApiError } from '../api/client';
import { getErrorKey } from './useAsyncOperation';

describe('user-safe API errors', () => {
  it.each([
    [new ApiError(401, 'auth.invalid_credentials'), 'errorInvalidCredentials'],
    [new ApiError(409, 'user.email_conflict'), 'errorEmailConflict'],
    [new ApiError(403, 'member.forbidden'), 'errorPermission'],
    [new ApiError(404, 'trip.not_found'), 'errorNotFound'],
    [new ApiError(429, 'rate_limit.exceeded'), 'errorRateLimited'],
    [new ApiError(503, 'database.internal'), 'errorServer'],
    [new ApiError(0, 'network.unavailable'), 'errorNetwork']
    , [new ApiError(403, 'auth.email_unverified'), 'errorEmailUnverified']
    , [new ApiError(400, 'email.verification_invalid'), 'errorVerificationInvalid']
    , [new ApiError(503, 'email.delivery_failed'), 'errorVerificationDelivery']
  ])('maps %o to %s', (error, expected) => {
    expect(getErrorKey(error)).toBe(expected);
  });

  it('uses a safe generic message for unknown thrown values', () => {
    expect(getErrorKey(new Error('SQL connection string leaked'))).toBe('errorUnexpected');
  });
});
