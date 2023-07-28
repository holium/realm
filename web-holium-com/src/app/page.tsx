'use client';
import { useEffect } from 'react';

import { useConnectionState } from './ws';

export default function Home() {
  const connectionState = useConnectionState();
  useEffect(() => {
    console.log(connectionState?.isConnected);
  }, [connectionState?.isConnected]);

  return (
    <main>
      <h1>web.holium.com</h1>
      <p>Implement WebSockets here.</p>
    </main>
  );
}
