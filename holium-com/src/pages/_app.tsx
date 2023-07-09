import * as Amplitude from '@amplitude/analytics-browser';
import type { AppProps } from 'next/app';

import { SpaceProvider } from 'components/SpaceContext';

import { constants } from '../consts';

import '../styles/app.css';

Amplitude.init(constants.AMPLITUDE_API_KEY);

export default function App({ Component, pageProps }: AppProps) {
  return (
    <SpaceProvider>
      <Component {...pageProps} />
    </SpaceProvider>
  );
}
