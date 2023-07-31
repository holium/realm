'use client';
import { useEffect } from 'react';

import { UrbitProtocol } from './lib/urbit';
import { APIConnection, ConduitConnectionState } from './lib/wscore';
import { AppModel, RootModel, useConnectionState } from './ws';

export default function Home() {
  const connectionState = useConnectionState();

  // one time load of entire app / root store
  // connects to holon over websocket. maintained as Singleton instance.
  useEffect(() => {
    console.warn('this should only ever be called once');
    const conn: APIConnection = APIConnection.getInstance(
      '~ralbes-mislec-lodlev-migdev',
      'napdem-fopbex-mapbus-ridmel'
    );

    // instantiate the root store model for state changes and observability
    const rootStore = RootModel.create({ app: AppModel.create() });

    // const protocol = new HolonProtocol(conn.conduit, rootStore);
    // implement the urbit "protocol" on top of the underlying websocket backbone
    const protocol = new UrbitProtocol(conn.conduit, rootStore);

    // make the urbit protocol the active protocol
    conn.use(protocol);

    console.log('connecting to websocket...');
    conn.connect().then((_connectionState: ConduitConnectionState) => {
      console.log('connected to websocket!');

      console.log('subscribing to spaces...');
      protocol.subscribe('spaces', '/updates');
    });
  }, []);

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
