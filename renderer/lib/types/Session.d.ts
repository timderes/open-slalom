/**
 * Represents a practice or competition session.
 */
type Session = {
  uuid: UUID;

  type: SessionType;

  slalomType: SlalomType;

  venueUuid?: UUID;

  date: Timestamp;

  lapsPerStint: number;

  unlimitedLapsPerStint: boolean;

  weather?: Weather;

  /**
   * Optional notes about the session.
   *
   * @example
   * "Rainy day, slippery track. Layout: Brezel and Schweizer."
   */
  notes?: string;

  createdAt: Timestamp;

  updatedAt: Timestamp;
};
