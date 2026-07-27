/**
 * Common shared types used across the database and renderer modules.
 */

/**
 * A UUID v4 string.
 */
type UUID = string;

/**
 * Unix timestamp in milliseconds since the epoch.
 */
type Timestamp = number;

/**
 * Kart slalom discipline. Either `JKS` (Jugendkart-Slalom)
 * or `SKS` (Superkart-Slalom).
 */
type SlalomType = 'JKS' | 'SKS';

/**
 * The type of session, either `practice` or `competition`.
 *
 * @example
 * Practice:
 * - Free practice
 * - Club training
 *
 * Competition:
 * - Official events
 * - Championships
 */
type SessionType = 'practice' | 'competition';

type Gender = 'male' | 'female' | 'other';

type Address = {
  street: string;
  city: string;
  postalCode: string;
  country: string;
};
