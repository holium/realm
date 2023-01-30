import { useEffect } from 'react';
import { observer } from 'mobx-react';
import { useTrayApps } from 'renderer/apps/store';
import { Rooms } from './List';
import { NewRoom } from './NewRoom';
import { Room } from './Room';
import { useRooms } from './useRooms';
import { Settings } from './Settings';
import { useServices } from 'renderer/logic/store';

export const RoomViews: { [key: string]: any } = {
  list: () => <Rooms />,
  'new-room': () => <NewRoom />,
  room: () => <Room />,
  settings: () => <Settings />,
};

export const RoomApp = observer(() => {
  const { ship } = useServices();
  const { roomsApp } = useTrayApps();
  const roomsManager = useRooms(ship?.patp);
  useEffect(() => {
    if (roomsManager.live.room) {
      roomsApp.setView('room');
    }
  }, [roomsApp, roomsManager.live.room]);
  const View = RoomViews[roomsApp.currentView];
  return <View />;
});
