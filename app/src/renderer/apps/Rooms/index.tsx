import { useEffect } from 'react';
import { observer } from 'mobx-react';

import { Flex } from '@holium/design-system/general';

import { RoomType } from 'renderer/apps/Rooms/store/RoomsStore';
import { useRoomsStore } from 'renderer/apps/Rooms/store/RoomsStoreContext';
import { useTrayApps } from 'renderer/apps/store';
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
  const roomsStore = useRoomsStore();
  const { roomsApp, dimensions } = useTrayApps();

  useEffect(() => {
    if (shellStore.micAllowed) return;

    MainIPC.askForMicrophone().then((status) => {
      if (status === 'denied') shellStore.setMicAllowed(false);
      else shellStore.setMicAllowed(true);
    });
  }, []);

  useEffect(() => {
    console.log('we are here');
    const mediaRoom = roomsStore.findActiveRoom(RoomType.media);
    if (mediaRoom && mediaRoom?.rid === roomsApp.currentRoomId) {
      roomsApp.setView('room');
    } else {
      roomsApp.setView('list');
    }
  }, [roomsApp, roomsApp.currentRoomId, roomsStore.rooms]);
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
