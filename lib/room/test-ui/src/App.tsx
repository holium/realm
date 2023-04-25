import { useEffect, useState } from 'react';
import { ShipConfig } from '@holium/realm-room';
import * as process from 'process';

import { RoomsManagerProvider } from './components/RoomsManagerProvider';
import { UI } from './UI';

import './App.css';

(window as any).global = window;
(window as any).process = process;
(window as any).Buffer = [];

export const App = () => {
  const [shipConfig, setShipConfig] = useState<ShipConfig | null>(null);

  useEffect(() => {
    const getAndSetShipConfig = async () => {
      const testShip = window.location.href.split('/')[3] || '~zod';

      const ships = await fetch('./ships.json');
      if (!ships.ok) {
        throw new Error('Failed to fetch ships.json');
      }

      const shipsJson = await ships.json();
      if (!shipsJson[testShip]) {
        throw new Error(`Ship ${testShip} not found in ships.json`);
      }

      setShipConfig(shipsJson[testShip]);
    };

    if (!shipConfig) getAndSetShipConfig();
  });

  if (!shipConfig) return <div>Ship config not found.</div>;

  return (
    <RoomsManagerProvider ship={shipConfig}>
      <UI />
    </RoomsManagerProvider>
  );
};
