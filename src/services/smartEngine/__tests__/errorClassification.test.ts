import { describe, it, expect } from 'vitest';
import { classifyError } from '../smartEngine';

describe('classifyError', () => {
  it('429 → rate_limit, retryable', () => {
    const err = classifyError(429);
    expect(err.type).toBe('rate_limit');
    expect(err.retryable).toBe(true);
  });

  it('402 → payment, not retryable', () => {
    const err = classifyError(402);
    expect(err.type).toBe('payment');
    expect(err.retryable).toBe(false);
  });

  it('401 → auth, retryable', () => {
    const err = classifyError(401);
    expect(err.type).toBe('auth');
    expect(err.retryable).toBe(true);
  });

  it('network keyword → network, retryable', () => {
    const err = classifyError(undefined, 'Failed to fetch');
    expect(err.type).toBe('network');
    expect(err.retryable).toBe(true);
  });

  it('network keyword case-insensitive', () => {
    expect(classifyError(undefined, 'NETWORK error').type).toBe('network');
    expect(classifyError(undefined, 'fetch aborted').type).toBe('network');
  });

  it('unknown fallback for unrecognized errors', () => {
    const err = classifyError(500, 'Internal server error');
    expect(err.type).toBe('unknown');
    expect(err.retryable).toBe(false);
  });

  it('undefined inputs → unknown', () => {
    const err = classifyError(undefined, undefined);
    expect(err.type).toBe('unknown');
    expect(err.message).toBe('Unknown error');
  });

  it('preserves custom message', () => {
    const err = classifyError(429, 'Too many requests buddy');
    expect(err.message).toBe('Too many requests buddy');
  });

  it('quota_exhausted is handled separately in engine (not by classifyError)', () => {
    // classifyError does NOT produce quota_exhausted — that's handled
    // by the engine when server returns "daily_limit_reached"
    // Verify classifyError never returns quota_exhausted
    const statuses = [400, 403, 404, 500, 502, 503];
    for (const s of statuses) {
      expect(classifyError(s).type).not.toBe('quota_exhausted');
    }
  });
});
