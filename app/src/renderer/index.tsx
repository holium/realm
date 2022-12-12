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
