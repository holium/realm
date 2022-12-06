import { useEffect } from 'react';
import { observer } from 'mobx-react';
import { useTrayApps } from 'renderer/apps/store';
import { Rooms } from './List';
import { NewRoom } from './NewRoom';
import { Room } from './Room';
import { useRooms } from './useRooms';

export const RoomViews: { [key: string]: any } = {
  list: () => <Rooms />,
  'new-room': () => <NewRoom />,
  room: () => <Room />,
};

export const RoomApp = observer(() => {
  const { roomsApp } = useTrayApps();
  const roomsManager = useRooms();
  useEffect(() => {
    if (roomsManager.presentRoom) {
      roomsApp.setView('room');
    }
  }, [roomsApp, roomsManager.presentRoom]);
  const View = RoomViews[roomsApp.currentView];
  return <View />;
});
