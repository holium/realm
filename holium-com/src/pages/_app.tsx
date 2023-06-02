import type { AppProps } from 'next/app';

import { SpaceProvider } from 'components/SpaceContext';

import '../styles/app.css';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <SpaceProvider>
      <Component {...pageProps} />
    </SpaceProvider>
  );
}
