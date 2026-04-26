import { Text } from '@mantine/core';
import { useOs } from '@mantine/hooks';

/**
 * Returns the current operating system name.
 */
const OsStatus = () => {
  /**
   * Gets the current operating system name.
   */
  const os = useOs();

  return (
    <Text fz="xs" tt="uppercase">
      {os}
    </Text>
  );
};
export default OsStatus;
