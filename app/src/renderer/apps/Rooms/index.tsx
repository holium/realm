import { observer } from 'mobx-react';
// import { toJS } from 'mobx';
import { ThemeModelType } from 'os/services/theme.model';
import { FC, useEffect } from 'react';
import { useTrayApps } from 'renderer/apps/store';
import { Rooms, RoomListProps } from './List';
import { NewRoom } from './NewRoom';
import { Room } from './Room';
import { Settings } from './Settings';
import { useRooms } from './useRooms';

export const RoomViews: { [key: string]: any } = {
  list: (props: RoomListProps) => <Rooms {...props} />,
  'new-room': (props: any) => <NewRoom {...props} />,
  room: (props: any) => <Room {...props} />,
  settings: (props: any) => <Settings {...props} />,
};

export interface RoomAppProps {
  theme: ThemeModelType;
  dimensions: {
    height: number;
    width: number;
  };
}

export const RoomApp: FC<RoomAppProps> = observer((props: RoomAppProps) => {
  const { roomsApp } = useTrayApps();
  const roomsManager = useRooms();
  useEffect(() => {
    if (roomsManager.presentRoom) {
      roomsApp.setView('room');
    }
  }, [roomsApp, roomsManager.presentRoom]);
  const View = RoomViews[roomsApp.currentView];
  return <View {...props} />;
});
