import { Head, Html, Main, NextScript } from 'next/document';
import { ColorSchemeScript, mantineHtmlProps } from '@mantine/core';
import { APP_LANGUAGE } from '@/lib/constants';

export default function Document() {
  return (
    <Html lang={APP_LANGUAGE} {...mantineHtmlProps}>
      <Head>
        <ColorSchemeScript defaultColorScheme="auto" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
