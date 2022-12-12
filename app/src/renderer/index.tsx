import { createRoot } from 'react-dom/client';
import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';
import App from './App';

Sentry.init({
  dsn: 'https://56fbf5e600db48cf8a785931be1ca5e4@o1327359.ingest.sentry.io/4504310987358208',
  integrations: [new BrowserTracing()],
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 1 : 0,
});

const container = document.getElementById('root')!;
const root = createRoot(container);
root.render(<App />);
