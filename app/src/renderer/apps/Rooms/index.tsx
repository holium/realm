import { observer } from 'mobx-react';
// import { toJS } from 'mobx';
import { ThemeModelType } from 'os/services/shell/theme.model';
import { FC } from 'react';
import { useTrayApps } from 'renderer/apps/store';
import { Rooms, RoomListProps } from './List';
import { NewRoom } from './NewRoom';
import { Room } from './Room';

export const RoomViews: { [key: string]: any } = {
  list: (props: RoomListProps) => <Rooms {...props} />,
  'new-room': (props: any) => <NewRoom {...props} />,
  room: (props: any) => <Room {...props} />,
};

export type RoomAppProps = {
  theme: ThemeModelType;
  dimensions: {
    height: number;
    width: number;
  };
};

export const RoomApp: FC<RoomAppProps> = observer((props: RoomAppProps) => {
  const { roomsApp } = useTrayApps();
  const View = RoomViews[roomsApp.currentView];
  return <View {...props} />;
});
