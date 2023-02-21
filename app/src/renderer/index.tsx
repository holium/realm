import { createRoot } from 'react-dom/client';
import * as Sentry from '@sentry/react';
import * as Amplitude from '@amplitude/analytics-browser';
import { BrowserTracing } from '@sentry/tracing';
import { App } from './App';

const environment = process.env.NODE_ENV;
const isProd = environment === 'production';

const sentryDsn = process.env.SENTRY_DSN;
if (sentryDsn) {
  process.stdout.write(
    `Initializing Sentry [release: ${process.env.SENTRY_RELEASE}]...\n`
  );
  Sentry.init({
    // this is defined 'on-the-fly' during staging/production builds where
    //  a .env file is defined with various values
    release: process.env.SENTRY_RELEASE,
    environment,
    dsn: process.env.SENTRY_DSN,
    integrations: [new BrowserTracing()],
    tracesSampleRate: 1,
    // Remove when we've done the window system refactor and are no longer using webviews.
    ignoreErrors: ['GUEST_VIEW_MANAGER_CALL'],
  });
} else {
  console.error('Environment variable for Sentry is undefined.');
}
const amplitudeApiKey = isProd
  ? process.env.AMPLITUDE_API_KEY
  : process.env.AMPLITUDE_API_KEY_DEV;
if (amplitudeApiKey) {
  Amplitude.init(amplitudeApiKey, undefined, {
    trackingOptions: {
      ipAddress: false,
    },
  });
} else {
  console.error('Environment variable for Amplitude is undefined.');
}

const container = document.getElementById('root')!;
const root = createRoot(container);
root.render(<App />);
