import { Text } from '@mantine/core';
import { useNetwork } from '@mantine/hooks';

/**
 * Returns the current network status (online/offline).
 */
const NetworkStatus = () => {
  /**
   * Gets the current network status.
   */
  const networkStatus = useNetwork();

  return (
    <Text c={networkStatus.online ? 'inherit' : 'red'} fz="xs" tt="uppercase">
      {networkStatus.online ? 'Online' : 'Offline'}
    </Text>
  );
};

export default NetworkStatus;
