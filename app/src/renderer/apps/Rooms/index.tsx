import { useEffect } from 'react';
import { observer } from 'mobx-react';

import { Flex } from '@holium/design-system/general';

import { useTrayApps } from 'renderer/apps/store';
import { useAppState } from 'renderer/stores/app.store';
import { MainIPC } from 'renderer/stores/ipc';

import { Rooms } from './List';
import { NewRoom } from './NewRoom';
import { Room } from './Room';
import { Settings } from './Settings';
// import { useRoomsStore } from './store/RoomsStoreContext';

const RoomViews: { [key: string]: any } = {
  list: () => <Rooms />,
  'new-room': () => <NewRoom />,
  room: () => <Room />,
  settings: () => <Settings />,
};

export const RoomAppPresenter = () => {
  const { shellStore } = useAppState();
  // const roomsStore = useRoomsStore();
  const { roomsApp, dimensions } = useTrayApps();

  useEffect(() => {
    if (shellStore.micAllowed) return;

    MainIPC.askForMicrophone().then((status) => {
      if (status === 'denied') shellStore.setMicAllowed(false);
      else shellStore.setMicAllowed(true);
    });
  }, []);

  useEffect(() => {
    console.log('checking live room %o', roomsApp.liveRoomId);
    if (roomsApp.liveRoomId) {
      roomsApp.setView('room');
    } else {
      roomsApp.setView('list');
    }
  }, [roomsApp.liveRoomId]);
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
