import { describe, expect, it } from 'vitest';
import translateGender from './translateGender';

describe('translateGender', () => {
  it('it should translate the genders correctly to german', () => {
    expect(translateGender('male')).toBe('Männlich');
    expect(translateGender('female')).toBe('Weiblich');
    expect(translateGender('other')).toBe('Divers');
  });
});
