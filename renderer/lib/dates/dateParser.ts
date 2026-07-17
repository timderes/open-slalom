import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);

/**
 * Parses user input and converts it to a date string value.
 *
 * @param input The user input string to parse
 * @returns A date string in ISO 8601 format (YYYY-MM-DD) or `null` if the input is invalid
 */
const dateParser = (input: string): string | null => {
  if (!input) return null;

  const formats = [
    // This is the format, when the user clicks on the date picker calendar
    'YYYY-MM-DD',
    // Other supported formats for user input
    'DDMMYYYY',
    'DD.MM.YYYY',
    'DD/MM/YYYY',
    'DD-MM-YYYY',
    'DD MM YYYY',
  ];

  for (const format of formats) {
    const parsed = dayjs(input, format, true);

    if (parsed.isValid()) {
      return parsed.format('YYYY-MM-DD');
    }
  }

  return null;
};

export default dateParser;
