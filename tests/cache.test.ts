import { describe, expect, it, vi } from 'vitest';
import { withFallback } from '../scripts/data/cache';

describe('withFallback', () => {
  it('returns fresh data when the fetcher succeeds', async () => {
    await expect(withFallback('x', async () => 'fresh', 'cached')).resolves.toBe('fresh');
  });

  it('retries once before giving up', async () => {
    const fetcher = vi.fn().mockRejectedValueOnce(new Error('boom')).mockResolvedValueOnce('second');
    await expect(withFallback('x', fetcher, 'cached')).resolves.toBe('second');
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it('falls back to cache after two failures', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const fetcher = vi.fn().mockRejectedValue(new Error('boom'));
    await expect(withFallback('x', fetcher, 'cached')).resolves.toBe('cached');
    expect(fetcher).toHaveBeenCalledTimes(2);
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });

  it('returns undefined when there is no cache', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    await expect(withFallback('x', () => Promise.reject(new Error('boom')), undefined)).resolves.toBeUndefined();
    warn.mockRestore();
  });
});
