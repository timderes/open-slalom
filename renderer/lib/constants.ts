/**
 * App-wide constants that can be used throughout the app.
 */

import type { ComboboxStringGroupData, TooltipProps } from '@mantine/core';
import pkg from '../../package.json';

export const APP_NAME = pkg.productName;
export const APP_VERSION = pkg.version;
export const APP_LANGUAGE = 'de';

export const APP_HEADER_HEIGHT = 60; // px
export const APP_FOOTER_HEIGHT = 60; // px
export const APP_NAVBAR_WIDTH = 200; // px
export const APP_ASIDE_WIDTH = 300; // px

/**
 * The height of the main content area of the app, calculated as the
 * full viewport height minus the header and footer heights.
 */
export const APP_MAIN_HEIGHT = `calc(100dvh - ${APP_HEADER_HEIGHT}px - ${APP_FOOTER_HEIGHT}px)`; // px

export const DEFAULT_DATE_FORMAT: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
};

export const DEFAULT_TIME_FORMAT: Intl.DateTimeFormatOptions = {
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
};

export const DEFAULT_TOOLTIP_PROPS: Omit<TooltipProps, 'label'> = {
  position: 'bottom',
  withArrow: true,
};

export const APP_ROUTES = [
  {
    path: '/',
    label: 'Startseite',
  },
  {
    path: '/trainings',
    label: 'Trainings',
  },
  {
    path: '/championships',
    label: 'Meisterschaften',
  },
  {
    path: '/drivers',
    label: 'Fahrer',
  },
  {
    path: '/karts',
    label: 'Karts',
  },
  {
    path: '/statistics',
    label: 'Statistiken',
  },
  {
    path: '/settings',
    label: 'Einstellungen',
  },
];

export const SETTINGS_ROUTES = [
  {
    path: '/settings',
    label: 'Datenbank',
  },
  {
    path: '/settings/restoreTraining',
    label: 'Training wiederherstellen',
  },
  {
    path: '/settings/colorScheme',
    label: 'Farbschema',
  },
];

// JKS class 0 only exists in North Rhine-Westphalia
export const JKS_CLASSES = [0, 1, 2, 3, 4, 5, 6, 7];
export const SKS_CLASSES = [1, 2, 3, 4, 5];

export const JKS_CLASS_AGE_RANGES = {
  0: { min: 7, max: 7 }, // Bambini (North-Rhine Westphalia only)
  1: { min: 8, max: 9 },
  2: { min: 10, max: 11 },
  3: { min: 12, max: 13 },
  4: { min: 14, max: 15 },
  5: { min: 16, max: 18 },
  6: { min: 19, max: 23 },
  7: { min: 24, max: null }, // adults / trainer class (open upper bound)
};

export const SKS_CLASS_AGE_RANGES = {
  1: { min: 12, max: 14 },
  2: { min: 15, max: 17 },
  3: { min: 18, max: 20 },
  4: { min: 21, max: 30 },
  5: { min: 31, max: null }, // adults / trainer class
};

export const CLASS_AGE_TABLE = {
  JKS: JKS_CLASS_AGE_RANGES,
  SKS: SKS_CLASS_AGE_RANGES,
};

/**
 * The minimum and maximum age for drivers.
 */
export const MIN_DRIVER_AGE = 5; // years
export const MAX_DRIVER_AGE = 99; // years

export const TIME_PENALTIES_JKS = {
  HIT_CONE: 2, // seconds
  MISSED_GATE: 10, // seconds
};

export const TIME_PENALTIES_SKS = {
  HIT_CONE: 3, // seconds
  MISSED_GATE: 10, // seconds
};

/**
 * The interval in milliseconds at which the stopwatch updates its time.
 */
export const DEFAULT_STOPWATCH_INTERVAL = 50; // ms

/**
 * Available genders for drivers. Together with their labels for display in the UI.
 */
export const GENDER_OPTIONS: ComboboxStringGroupData = [
  {
    label: 'Männlich',
    value: 'male',
  },
  {
    label: 'Weiblich',
    value: 'female',
  },
  {
    label: 'Divers',
    value: 'other',
  },
];
