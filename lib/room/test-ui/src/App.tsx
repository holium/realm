import { useEffect, useState } from 'react';
import { ShipConfig } from '../../src/types';
import { RoomsManagerProvider } from '../../src/RoomsManagerProvider';
import './App.css';
import { UI } from './UI';

// NOTE: to connect one ship to another, you must manually poke the ship to `set-provider` like:
// :rooms-v2 &rooms-v2-session-action [%set-provider ~dev]
//  (^ on the dojo of ~fes if he wanted to connect to a room hosted by ~dev)

export const App = () => {
  const [shipConfig, setShipConfig] = useState<ShipConfig>();

  useEffect(() => {
    const getAndSetShipConfig = async () => {
      const testShip = window.location.href.split('/')[3] || '~zod';

      const ships = await fetch('./ships.json');
      if (!ships.ok) throw new Error('Failed to fetch ships.json');
      const shipsJson = await ships.json();
      if (!shipsJson[testShip])
        throw new Error(`Ship ${testShip} not found in ships.json`);

      setShipConfig(shipsJson[testShip]);
    };

    getAndSetShipConfig();
  }, []);

  if (!shipConfig) return <div>Ship config not found.</div>;

  return (
    <RoomsManagerProvider ship={shipConfig}>
      <UI />
    </RoomsManagerProvider>
  );
};
