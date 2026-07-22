import getGapIndicator from './getGapIndicator';

export type TimeFormatPreset = 'lap' | 'duration' | 'gap';

type FormatTimeOptions = {
  showHours?: boolean;
  showMilliseconds?: boolean;
  trimLeadingZeroMinutes?: boolean;
  padSeconds?: boolean;
};

const formatTimeBase = (
  time: number,
  {
    showHours = false,
    showMilliseconds = false,
    trimLeadingZeroMinutes = false,
    padSeconds = false,
  }: FormatTimeOptions = {},
): string => {
  const absTime = Math.abs(time);

  const totalSeconds = Math.floor(absTime / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const milliseconds = Math.floor(absTime % 1000);

  if (showMilliseconds) {
    if (hours > 0 || showHours) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds
        .toString()
        .padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`;
    }

    if (minutes === 0 && trimLeadingZeroMinutes) {
      const sec = padSeconds ? seconds.toString().padStart(2, '0') : seconds.toString();

      return `${sec}.${milliseconds.toString().padStart(3, '0')}`;
    }

    return `${minutes}:${seconds.toString().padStart(2, '0')}.${milliseconds
      .toString()
      .padStart(3, '0')}`;
  }

  if (hours > 0 || showHours) {
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

export const formatTime = (time: number, preset: TimeFormatPreset): string => {
  switch (preset) {
    case 'lap':
      return formatTimeBase(time, {
        showMilliseconds: true,
        trimLeadingZeroMinutes: true,
        padSeconds: true,
      });

    case 'duration':
      return formatTimeBase(time);

    case 'gap': {
      const indicator = getGapIndicator(time);

      return (
        indicator +
        formatTimeBase(time, {
          showMilliseconds: true,
          trimLeadingZeroMinutes: true,
          padSeconds: false,
        })
      );
    }

    default:
      return String(time);
  }
};
