import { APP_LANGUAGE, DEFAULT_TIME_FORMAT } from '../constants';

/**
 * Returns the current local time formatted to a german locale string.
 * The time is formatted according to the DEFAULT_TIME_FORMAT constant.
 *
 * @example getCurrentTime() // --> "14:30:45"
 */
const getCurrentTime = () => {
  return new Date().toLocaleTimeString(APP_LANGUAGE, {
    ...DEFAULT_TIME_FORMAT,
  });
};

export default getCurrentTime;
