import { Head, Html, Main, NextScript } from 'next/document';
import { ColorSchemeScript, mantineHtmlProps } from '@mantine/core';
import { APP_LANGUAGE } from '@/lib/constants';

/**
 * The custom Document allows to alter the applications `<html>` and `<body>` tags.
 *
 * It is only rendered on the server side and not on the client side, so event handlers
 * like `onClick` cannot be used in this file.
 *
 * @see {@link https://nextjs.org/docs/pages/building-your-application/routing/custom-document}
 */
const Document = () => {
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
};

export default Document;
