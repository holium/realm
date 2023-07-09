import * as Sentry from '@sentry/nextjs';

if (process.env.NODE_ENV === 'production') {
  Sentry.init({
    dsn: 'https://542d2ccab0f64d5cbad472a6b43b10ee@o1327359.ingest.sentry.io/4505121457176576',
    tracesSampleRate: 1.0,
  });
}
