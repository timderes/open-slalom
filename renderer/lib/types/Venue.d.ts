/**
 * Represents a training or competition location.
 */
type Venue = {
  uuid: UUID;

  name: string;

  address?: Address;

  notes?: string;

  createdAt: Timestamp;

  updatedAt: Timestamp;
};
