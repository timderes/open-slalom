import { describe, expect, it, vi } from 'vitest';
import { getJksClass, getSksClass } from './getDriverClass';
import { JKS_CLASSES, SKS_CLASSES } from '../constants';

// Stop the system time to a fixed date for consistent age calculations
// in tests
vi.useFakeTimers();
vi.setSystemTime(new Date('2026-01-01'));

describe('getDriverClass', () => {
  it("returns '-' for invalid birthDate", () => {
    expect(getJksClass({ birthDate: 'invalid-date' })).toBe('-');
    expect(getSksClass({ birthDate: 'invalid-date' })).toBe('-');
  });

  it('returns a valid JKS class', () => {
    const testDates = ['2018-01-01', '2015-06-15', '2012-03-10', '2008-09-20', '2000-01-01'];

    for (const birthDate of testDates) {
      const result = getJksClass({ birthDate });

      expect(JKS_CLASSES.includes(result as number) || result === '-').toBe(true);
    }
  });

  it('returns a valid SKS class', () => {
    const testDates = ['2014-01-01', '2010-01-01', '2005-01-01', '1995-01-01'];

    for (const birthDate of testDates) {
      const result = getSksClass({ birthDate });

      expect(SKS_CLASSES.includes(result as number) || result === '-').toBe(true);
    }
  });

  it("returns '-' if the driver is too young for JKS or SKS", () => {
    const tooYoungJks = '2023-01-01'; // 3 years old
    const tooYoungSks = '2015-01-01'; // 11 years old

    expect(getJksClass({ birthDate: tooYoungJks })).toBe('-');
    expect(getSksClass({ birthDate: tooYoungSks })).toBe('-');
  });
});
