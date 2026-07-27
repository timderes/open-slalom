/**
 * Represents a kart used in slalom events.
 */
type Kart = {
  uuid: UUID;

  /**
   * @example `Kart 1` or `JKS #1`
   */
  name: string;

  /**
   * The chassis name with manufacturer
   * @example `MS-Kart RA97`
   */
  chassis?: string;

  /**
   * The engine name with manufacturer.
   * @example `Honda GX-200`
   */
  engine?: string;

  type: SlalomType;

  createdAt: Timestamp;

  updatedAt: Timestamp;
};
