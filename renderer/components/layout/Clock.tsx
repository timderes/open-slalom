import useClock from '@/hooks/useClock';
import { APP_LANGUAGE, DEFAULT_DATE_FORMAT } from '@/lib/constants';
import { Text, type TextProps } from '@mantine/core';

type ClockProps = TextProps;

/**
 * Display the current time and date. The time is updated every
 * second to stay in sync with the system clock.
 */
const Clock = ({ ...props }: ClockProps) => {
  const time = useClock();
  const now = new Date();

  const date = now.toLocaleDateString(APP_LANGUAGE, {
    ...DEFAULT_DATE_FORMAT,
  });
  const isoDateString = now.toISOString();

  return (
    <Text {...props} ms={props.ms ?? 'auto'}>
      {date} <time dateTime={isoDateString}>{time}</time>
    </Text>
  );
};

export default Clock;
