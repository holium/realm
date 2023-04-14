import { createRoot } from 'react-dom/client';
import * as Sentry from '@sentry/react';
import * as Amplitude from '@amplitude/analytics-browser';
import { BrowserTracing } from '@sentry/browser';
import { RewriteFrames as RewriteFramesIntegration } from '@sentry/integrations';
import { App } from './App';

const environment = process.env.NODE_ENV;
const isProd = environment === 'production';

const sentryDsn = process.env.SENTRY_DSN;
if (sentryDsn) {
  let cfg: Sentry.BrowserOptions = {
    environment,
    dsn: process.env.SENTRY_DSN,
    integrations: [
      new BrowserTracing(),
      new RewriteFramesIntegration({
        // function that takes the frame, applies a transformation, and returns it
        iteratee: (frame: any) => {
          // example frame contents from crash
          // {
          //   "function": "HTMLDivElement.r",
          //   "filename": "/Applications/Realm.app/Contents/Resources/app.asar/dist/renderer/app.renderer.js",
          //   "abs_path": "file:///Applications/Realm.app/Contents/Resources/app.asar/dist/renderer/app.renderer.js",
          //   "lineno": 2,
          //   "colno": 397144,
          //   "in_app": true
          // },
          if (frame.abs_path) {
            // strip everything between the file:// and the /dist folder
            const abs_path = frame.abs_path;
            console.log('mapping frame');
            const idx = frame.abs_path.lastIndexOf('/dist/');
            if (idx !== 1) {
              frame.abs_path = frame.abs_path.substring(idx + 1);
            }
            console.log(
              `mapping stack trace frame '%o' to '%o`,
              abs_path,
              frame.abs_path
            );
          }
          return frame;
        },
      }),
    ],
    tracesSampleRate: 1,
    ignoreErrors: [
      // Remove when we've done the window system refactor and are no longer using webviews.
      'GUEST_VIEW_MANAGER_CALL',
      // False alarm caused by react-dom/server renderToString.
      'useLayoutEffect',
    ],
  };
  if (process.env.BUILD_VERSION) {
    console.log(
      `Initializing Sentry [release: ${process.env.BUILD_VERSION}]...`
    );
    cfg.release = process.env.BUILD_VERSION;
  }
  Sentry.init(cfg);
} else {
  console.warn('Environment variable for Sentry is undefined.');
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
  console.warn('Environment variable for Amplitude is undefined.');
}

const container = document.getElementById('root');
const root = createRoot(container as HTMLElement);
root.render(<App />);
