import useClock from '@/hooks/useClock';
import { DEFAULT_DATE_FORMAT } from '@/lib/constants';
import { Text, type TextProps } from '@mantine/core';

type ClockProps = TextProps;

/**
 * Display the current time. Updates every 500ms to stay
 * in sync with the system clock.
 */
const Clock = ({ ...props }: ClockProps) => {
  const time = useClock();

  const date = new Date().toLocaleDateString('de', {
    ...DEFAULT_DATE_FORMAT,
  });

  return (
    <Text {...props} ms={props.ms ?? 'auto'}>
      {date} <time>{time}</time>
    </Text>
  );
};

export default Clock;
