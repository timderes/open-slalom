// Import styles of packages that you've installed.
// All packages except `@mantine/hooks` require styles imports
import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import "@mantine/notifications/styles.css";

import "dayjs/locale/de";

import type { AppProps } from "next/app";

import { createTheme, MantineProvider } from "@mantine/core";
import { DatesProvider } from "@mantine/dates";
import { ModalsProvider } from "@mantine/modals";
import { Notifications } from "@mantine/notifications";

const theme = createTheme({
  /** Put your mantine theme override here */
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <MantineProvider theme={theme}>
      <Notifications limit={3} position="top-right" />
      <DatesProvider settings={{ locale: "de" }}>
        <ModalsProvider>
          <Component {...pageProps} />
        </ModalsProvider>
      </DatesProvider>
    </MantineProvider>
  );
}
