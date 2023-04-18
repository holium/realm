import { createRoot } from 'react-dom/client';
import * as Sentry from '@sentry/react';
import * as Amplitude from '@amplitude/analytics-browser';
import { BrowserTracing } from '@sentry/browser';
import { RewriteFrames as RewriteFramesIntegration } from '@sentry/integrations';
import { App } from './App';

const environment = process.env.NODE_ENV;
const isProd = environment === 'production';

// const sentryDsn = process.env.SENTRY_DSN;
// if (sentryDsn) {
let cfg: Sentry.BrowserOptions = {
  environment,
  dsn: 'https://56fbf5e600db48cf8a785931be1ca5e4@o1327359.ingest.sentry.io/4504310987358208',
  integrations: [
    new BrowserTracing(),
    new RewriteFramesIntegration({
      // prefix: 'app://',
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
        console.log('frame => %o', frame);
        if (frame.filename) {
          // strip everything between the file:// and the /dist folder
          const filename = frame.filename;
          console.log('mapping frame');
          const idx = filename.lastIndexOf('/');
          if (idx !== 1) {
            frame.filename = `app:///${filename.substring(idx + 1)}`;
          } else {
            frame.filename = `app:///${filename}`;
          }
          console.log(
            `mapping stack trace frame '%o' to '%o`,
            filename,
            frame.filename
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
  console.log(`Initializing Sentry [release: ${process.env.BUILD_VERSION}]...`);
  cfg.release = process.env.BUILD_VERSION;
  cfg.dist = process.env.BUILD_VERSION;
}
Sentry.init(cfg);
// } else {
//   console.warn('Environment variable for Sentry is undefined.');
// }
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
