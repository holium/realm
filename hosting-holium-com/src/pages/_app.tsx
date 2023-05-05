import * as Amplitude from '@amplitude/analytics-browser';
import type { AppProps } from 'next/app';
import NextProgress from 'next-progress';

import { constants } from '../util/constants';

import '../style/app.css';

Amplitude.init(constants.AMPLITUDE_API_KEY, undefined, {
  trackingOptions: {
    ipAddress: false,
  },
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <NextProgress
        color="rgba(var(--rlm-accent-rgba))"
        options={{ showSpinner: false }}
      />
      <Component {...pageProps} />
    </>
  );
}
