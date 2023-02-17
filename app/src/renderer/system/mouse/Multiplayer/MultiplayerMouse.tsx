import { useEffect, useState } from 'react';
import { MultiplayerShipType, Provider } from '@holium/realm-multiplayer';
import { api } from './multiplayer';
import { Presences } from './Presences';
import { Mouse } from '../Mouse';

export const MultiplayerMouse = () => {
  const [ship, setShip] = useState<MultiplayerShipType | null>(null);
  const [channel, setChannel] = useState<string | null>(null);

  useEffect(() => {
    window.electron.app.onSetMultiplayerShip(setShip);
    window.electron.app.onSetMultiplayerChannel(setChannel);
  }, []);

  if (!ship || !channel) return null;

  return (
    <Provider api={api} ship={ship} channel={channel}>
      <Mouse />
      <Presences />
    </Provider>
  );
};
