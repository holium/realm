import { RoomsManagerProvider, ShipConfig } from '@holium/realm-room';
import { useEffect, useState } from 'react';
import { Loader } from './components/Loader';
import { TextEditor } from './components/TextEditor';

export const App = () => {
  const [shipConfig, setShipConfig] = useState<ShipConfig>();

  useEffect(() => {
    const interval = setInterval(() => {
      if (window.shipConfig) {
        setShipConfig(window.shipConfig);
        clearInterval(interval);
      }
    }, 500);
  }, []);

  if (!shipConfig) return <Loader />;

  return (
    <RoomsManagerProvider ship={shipConfig}>
      <TextEditor />
    </RoomsManagerProvider>
  );
};
