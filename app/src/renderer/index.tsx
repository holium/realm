import { createRoot } from 'react-dom/client';
import * as Sentry from '@sentry/react';
import * as Amplitude from '@amplitude/analytics-browser';
import { BrowserTracing } from '@sentry/tracing';
import App from './App';

const environment = process.env.NODE_ENV;
const isProd = environment === 'production';
const isDebug = process.env.DEBUG_PROD === 'true';

Sentry.init({
  debug: isDebug,
  enabled: isProd,
  environment,
  dsn: 'https://56fbf5e600db48cf8a785931be1ca5e4@o1327359.ingest.sentry.io/4504310987358208',
  integrations: [new BrowserTracing()],
  tracesSampleRate: 1,
});

Amplitude.init('d6d123a2a660806abcc6b1845c475f2f', undefined, {
  optOut: !isProd,
  trackingOptions: {
    ipAddress: false,
  },
});

const container = document.getElementById('root')!;
const root = createRoot(container);
root.render(<App />);
