import { describe, expect, it, vi } from 'vitest';
import getCurrentTime from './getCurrentTime';

vi.useFakeTimers();
vi.setSystemTime(new Date('2026-01-01T14:30:45'));

describe('getCurrentTime', () => {
  it('returns the current time formatted according to DEFAULT_TIME_FORMAT', () => {
    const result = getCurrentTime();
    expect(result).toBe('14:30:45');
  });
});
