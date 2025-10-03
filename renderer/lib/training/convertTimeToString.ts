/**
 * Converts time in milliseconds to a string in format mm:ss:msmsms
 * If the time is less than 1 minute, it returns ss:msmsms
 *
 * @param time in milliseconds
 * @returns time in format mm:ss:msmsms
 *
 * @example
 * convertTimeToString(65000) // "1:05.000"
 * convertTimeToString(45000) // "45.000"
 * convertTimeToString(123456) // "2:03.456"
 */
const convertTimeToString = (time: number): string => {
  const minutes = Math.floor(time / 60000);
  const seconds = Math.floor((time % 60000) / 1000);
  const milliseconds = Math.floor(time % 1000);

  // If time is less then 60 seconds, don't show minutes
  if (minutes === 0) {
    return `${seconds.toString().padStart(2, "0")}.${milliseconds
      .toString()
      .padStart(3, "0")}`;
  }

  return `${minutes.toString().padStart(1, "0")}:${seconds
    .toString()
    .padStart(2, "0")}.${milliseconds.toString().padStart(3, "0")}`;
};

export default convertTimeToString;
