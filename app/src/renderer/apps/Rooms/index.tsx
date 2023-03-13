import { useEffect } from 'react';
import { observer } from 'mobx-react';
import { useTrayApps } from 'renderer/apps/store';
import { Rooms } from './List';
import { NewRoom } from './NewRoom';
import { Room } from './Room';
import { useRooms } from './useRooms';
import { Settings } from './Settings';
import { useServices } from 'renderer/logic/store';
import { Flex } from '@holium/design-system';
import { RealmActions } from 'renderer/logic/actions/main';

const RoomViews: { [key: string]: any } = {
  list: () => <Rooms />,
  'new-room': () => <NewRoom />,
  room: () => <Room />,
  settings: () => <Settings />,
};

export const RoomAppPresenter = () => {
  const { desktop, ship } = useServices();
  const { roomsApp, dimensions } = useTrayApps();
  const roomsManager = useRooms(ship?.patp);

  useEffect(() => {
    if (desktop.micAllowed) return;

    RealmActions.askForMicrophone().then((status) => {
      if (status === 'denied') desktop.setMicAllowed(false);
      else desktop.setMicAllowed(true);
    });
  }, []);

  useEffect(() => {
    if (roomsManager?.live.room) {
      roomsApp.setView('room');
    }
  }, [roomsApp, roomsManager?.live.room]);
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
