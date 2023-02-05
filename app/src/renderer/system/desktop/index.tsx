import { observer } from 'mobx-react';
import { Bottom, Layer, Fill } from 'react-spaces';
import { SystemBar } from './components/SystemBar/SystemBar';
import { WindowManager } from './WindowManager';
import { HomePane } from './components/Home';
import { useServices } from 'renderer/logic/store';
import { TrayManager } from './TrayManager';
import { useRooms } from 'renderer/apps/Rooms/useRooms';

const DesktopPresenter = () => {
  const { ship, desktop } = useServices();
  useRooms(ship?.patp); // creates first instance of roomsManager

  return (
    <Fill>
      <Layer zIndex={0}>
        <WindowManager />
      </Layer>
      <Layer zIndex={1}>{desktop.showHomePane && <HomePane />}</Layer>
      <Layer zIndex={13}>
        <TrayManager />
      </Layer>
      <Layer zIndex={14}>
        <Bottom size={56}>
          <SystemBar />
        </Bottom>
      </Layer>
    </Fill>
  );
};

export const Desktop = observer(DesktopPresenter);
