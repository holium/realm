import { useEffect, useState } from 'react';
import {
  ProtocolConfig,
  RoomsManagerProvider,
  ShipConfig,
} from '@holium/realm-room';
import { Loader } from './components/Loader';
import { TextEditor } from './components/TextEditor';

export const App = () => {
  const [shipConfig, setShipConfig] = useState<ShipConfig>();
  const [protocolConfig, setProtocolConfig] = useState<ProtocolConfig>();
  const [rid, setRid] = useState<string>();

  useEffect(() => {
    const interval = setInterval(() => {
      if (window.shipConfig && window.protocolConfig && window.rid) {
        setShipConfig(window.shipConfig);
        setProtocolConfig(window.protocolConfig);
        setRid(window.rid);
        clearInterval(interval);
      }
    }, 500);
  }, []);

  if (!shipConfig) return <Loader text="Loading ship config..." />;
  if (!protocolConfig) return <Loader text="Loading protocol config..." />;
  if (!rid) return <Loader text="Loading room id..." />;

  return (
    <RoomsManagerProvider
      ship={shipConfig}
      protocolConfig={protocolConfig}
      rid={rid}
    >
      <TextEditor />
    </RoomsManagerProvider>
  );
};
