'use client';
import { useEffect } from 'react';
import { observer } from 'mobx-react-lite';

import { HolonProtocol } from './lib/holon';
import { UrbitProtocol } from './lib/urbit';
import { APIConnection, ConduitConnectionState } from './lib/wscore';
import { AppModel, RootModel, useConnectionState } from './ws';

const Home = observer(() => {
  const connectionState = useConnectionState();

  // one time load of entire app / root store
  // connects to holon over websocket. maintained as Singleton instance.
  useEffect(() => {
    const conn: APIConnection = APIConnection.getInstance(
      '~ralbes-mislec-lodlev-migdev',
      'napdem-fopbex-mapbus-ridmel'
    );

    // instantiate the root store model for state changes and observability
    const rootStore = RootModel.create({ app: AppModel.create() });

    // we are only interested in the UrbitProtocol for sending messages, but
    // need the Holon protocol to handle special use cases
    const urbit_protocol = new UrbitProtocol(rootStore);

    // make the urbit protocol the active protocol
    conn.register_protocol(urbit_protocol);
    conn.register_protocol(new HolonProtocol(rootStore));

    console.log('connecting to websocket...');
    conn
      .connect(rootStore)
      .then((_connectionStatus: ConduitConnectionState) => {
        console.log('connected to websocket!');

        console.log('subscribing to spaces...');
        // use the urbit protocol to subscribe to spaces /updates
        urbit_protocol.subscribe('spaces', '/updates');
      })
      .catch((e) => console.error(e));
  }, []);

  useEffect(() => {
    console.log(connectionState?.status);
  }, [connectionState?.status]);

  return (
    <main>
      <h1>web.holium.com</h1>
      <p>Implement WebSockets here.</p>
    </main>
  );
});

export default Home;
