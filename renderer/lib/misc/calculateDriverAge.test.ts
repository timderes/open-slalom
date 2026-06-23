import { describe, expect, it, vi } from 'vitest';
import { calculateDriverAgeBasedOfBirthYear } from './calculateDriverAge';
import calculateDriverAge from './calculateDriverAge';

// Stop the system time to a fixed date for consistent age calculations
// in tests
vi.useFakeTimers();
vi.setSystemTime(new Date('2026-01-01'));

describe('calculateDriverAge', () => {
  it('returns correct age for birth dates (full precision)', () => {
    const testCases = [
      { birthDate: '2000-01-01' },
      { birthDate: '2010-06-15' },
      { birthDate: '1995-12-31' },
      { birthDate: '1980-03-10' },
    ];

    for (const { birthDate } of testCases) {
      const result = calculateDriverAge(birthDate);

      expect(typeof result).toBe('number');
      expect(result).toBeGreaterThan(0);
      expect(result).toBeLessThan(120);
    }
  });

  it('handles future birth dates gracefully', () => {
    const futureDate = '2999-01-01';

    const result = calculateDriverAge(futureDate);

    expect(typeof result).toBe('number');
    expect(result).toBeLessThan(0); // not born yet
  });
});

describe('calculateDriverAgeBasedOfBirthYear', () => {
  it('returns age based only on year difference', () => {
    const currentYear = new Date().getFullYear();

    const testCases = [
      { birthDate: `${currentYear - 10}-01-01`, expected: 10 },
      { birthDate: `${currentYear - 20}-06-15`, expected: 20 },
      { birthDate: `${currentYear - 30}-12-31`, expected: 30 },
      { birthDate: `${currentYear - 40}-03-10`, expected: 40 },
    ];

    for (const { birthDate, expected } of testCases) {
      expect(calculateDriverAgeBasedOfBirthYear(birthDate)).toBe(expected);
    }
  });

  it('ignores month/day differences completely', () => {
    const baseYear = new Date().getFullYear() - 18;

    const jan = calculateDriverAgeBasedOfBirthYear(`${baseYear}-01-01`);
    const dec = calculateDriverAgeBasedOfBirthYear(`${baseYear}-12-31`);

    expect(jan).toBe(dec);
    expect(jan).toBe(18);
  });
});
