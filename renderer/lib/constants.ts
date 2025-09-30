/**
 * App-wide constants that can be used throughout the app.
 */

import pkg from "../../package.json";

export const APP_NAME = pkg.productName;
export const APP_VERSION = pkg.version;

export const DEFAULT_DATE_FORMAT: Intl.DateTimeFormatOptions = {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
};

export const DEFAULT_TIME_FORMAT: Intl.DateTimeFormatOptions = {
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
};

export const APP_ROUTES = [
  {
    path: "/",
    label: "Startseite",
  },
  {
    path: "/training",
    label: "Neues Training",
  },
  {
    path: "/drivers",
    label: "Fahrer",
  },
  {
    path: "/settings",
    label: "Einstellungen",
  },
];
