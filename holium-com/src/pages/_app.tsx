import * as Amplitude from '@amplitude/analytics-browser';
import type { AppProps } from 'next/app';

import { SpaceProvider } from 'components/SpaceContext';

import { constants } from '../constants';

import '../styles/app.css';

if (process.env.NODE_ENV === 'production') {
  Amplitude.init(constants.AMPLITUDE_API_KEY);
}

export default function App({ Component, pageProps }: AppProps) {
  return (
    <SpaceProvider>
      <Component {...pageProps} />
    </SpaceProvider>
  );
}
