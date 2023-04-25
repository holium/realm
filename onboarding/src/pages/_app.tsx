import * as Amplitude from '@amplitude/analytics-browser';
import type { AppProps } from 'next/app';

import { constants } from '../util/constants';

import '../style/app.css';

Amplitude.init(constants.AMPLITUDE_API_KEY, undefined, {
  trackingOptions: {
    ipAddress: false,
  },
});

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
