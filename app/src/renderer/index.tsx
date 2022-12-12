import { createRoot } from 'react-dom/client';
import * as Sentry from '@sentry/react';
import * as Amplitude from '@amplitude/analytics-browser';
import { BrowserTracing } from '@sentry/tracing';
import App from './App';

const environment = process.env.NODE_ENV;
const isProd = environment === 'production';
const isDebug = process.env.DEBUG_PROD === 'true';

const sentryDsn = process.env.SENTRY_DSN;
if (sentryDsn) {
  Sentry.init({
    enabled: isProd,
    debug: isDebug,
    environment,
    dsn: process.env.SENTRY_DSN,
    integrations: [new BrowserTracing()],
    tracesSampleRate: 1,
  });
} else {
  console.error('Environment variable SENTRY_DSN is not defined.');
}
const amplitudeApiKey = process.env.AMPLITUDE_API_KEY;
if (amplitudeApiKey) {
  Amplitude.init(amplitudeApiKey, undefined, {
    optOut: !isProd,
    trackingOptions: {
      ipAddress: false,
    },
  });
} else {
  console.error('Environment variable AMPLITUDE_API_KEY is not defined.');
}

const container = document.getElementById('root')!;
const root = createRoot(container);
root.render(<App />);
