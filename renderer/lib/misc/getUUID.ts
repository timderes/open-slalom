import { v4, type Version4Options } from 'uuid';

/**
 * Generates a new UUID (version 4) using the `uuid` library.
 *
 * @param options - Optional configuration for UUID generation.
 * @returns A new UUID string.
 */
const getUUID = (options?: Version4Options): string => {
  return v4({ ...options });
};

export default getUUID;
