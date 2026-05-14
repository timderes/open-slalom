import getCurrentTime from '@/lib/time/getCurrentTime';
import { useInterval } from '@mantine/hooks';
import {
  createContext,
  createElement,
  type PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from 'react';

type ClockProviderProps = PropsWithChildren;

const ClockContext = createContext<string | undefined>(undefined);

/**
 * Provides the current time to its children. Updates every second to stay
 * in sync with the system clock.
 */
const ClockProvider = ({ children }: ClockProviderProps) => {
  const [currentTime, setCurrentTime] = useState<string>(() => getCurrentTime());

  const interval = useInterval(() => {
    setCurrentTime(getCurrentTime());
  }, 1000); // ms

  useEffect(() => {
    interval.start();

    return interval.stop;
  }, [interval]);

  return createElement(ClockContext.Provider, { value: currentTime }, children);
};

/**
 * A custom hook for accessing the current time within a ClockProvider.
 * @returns The current time as a string.
 */
const useClock = (): string => {
  const context = useContext(ClockContext);

  if (!context) {
    throw new Error('useClock must be used within a ClockProvider');
  }

  return context;
};

export default useClock;
export { ClockProvider, useClock };
