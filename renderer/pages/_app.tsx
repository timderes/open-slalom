// All packages except `@mantine/hooks` require styles imports
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import '@mantine/notifications/styles.css';

import '../styles/globals.css';

// If we add multiple locales, we need to import them here and
// set the locale in the `DatesProvider` below
import 'dayjs/locale/de';

import type { AppProps } from 'next/app';
import Head from 'next/head';
import { createTheme, MantineProvider } from '@mantine/core';
import { DatesProvider } from '@mantine/dates';
import { ModalsProvider } from '@mantine/modals';
import { Notifications } from '@mantine/notifications';
import { APP_LANGUAGE, APP_NAME } from '@/lib/constants';
import { ClockProvider } from '@/hooks/useClock';

const theme = createTheme({
  // Put mantine theme override here...
});

/**
 * The custom App component initialize pages. Here we  place global CSS imports
 * and wrap the app with providers that should be available on all pages.
 *
 * @see {@link https://nextjs.org/docs/pages/building-your-application/routing/custom-app}
 */
const App = ({ Component, pageProps }: AppProps) => {
  return (
    <MantineProvider deduplicateInlineStyles defaultColorScheme="auto" theme={theme}>
      <Head>
        <title>{APP_NAME}</title>
      </Head>
      <Notifications limit={3} position="top-right" />
      <DatesProvider settings={{ locale: APP_LANGUAGE }}>
        <ModalsProvider>
          <ClockProvider>
            <Component {...pageProps} />
          </ClockProvider>
        </ModalsProvider>
      </DatesProvider>
    </MantineProvider>
  );
};

export default App;
