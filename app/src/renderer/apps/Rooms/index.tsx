import { useEffect } from 'react';
import { observer } from 'mobx-react';

import { Flex } from '@holium/design-system';

import { useTrayApps } from 'renderer/apps/store';
import { useShipStore } from 'renderer/stores/ship.store';
import { useAppState } from 'renderer/stores/app.store';
import { MainIPC } from 'renderer/stores/ipc';

import { Rooms } from './List';
import { NewRoom } from './NewRoom';
import { Room } from './Room';
import { Settings } from './Settings';

const RoomViews: { [key: string]: any } = {
  list: () => <Rooms />,
  'new-room': () => <NewRoom />,
  room: () => <Room />,
  settings: () => <Settings />,
};

export const RoomAppPresenter = () => {
  const { shellStore } = useAppState();
  const { roomsStore } = useShipStore();
  const { roomsApp, dimensions } = useTrayApps();

  useEffect(() => {
    if (shellStore.micAllowed) return;

    MainIPC.askForMicrophone().then((status) => {
      if (status === 'denied') shellStore.setMicAllowed(false);
      else shellStore.setMicAllowed(true);
    });
  }, []);

  useEffect(() => {
    if (roomsStore.current) {
      roomsApp.setView('room');
    }
  }, [roomsApp, roomsStore.current]);
  const View = RoomViews[roomsApp.currentView];
  return (
    <Flex
      position="relative"
      height={dimensions.height - 24}
      flexDirection="column"
    >
      <View />
    </Flex>
  );
};

export const RoomApp = observer(RoomAppPresenter);
