import { NextConfig } from 'next';

const config: NextConfig = {
  // we need to export static files so as Electron can handle them
  output: 'export',

  distDir:
    process.env.NODE_ENV === 'production'
      ? // we want to change `distDir` to "../app" so as nextron can build the app in production mode!
        '../app'
      : // default `distDir` value
        '.next',

  // e.g. home.html => home/index.html
  trailingSlash: true,

  // we need to disable image optimization, because it is not compatible with `{ output: 'export' }`
  images: {
    unoptimized: true,
  },
};

export default config;
