import { observer } from 'mobx-react';
import { Bottom, Layer, Fill } from 'react-spaces';
import { SystemBar } from './components/SystemBar/SystemBar';
import { HomePane } from './components/Home/HomePane';
import { useServices } from 'renderer/logic/store';
import { TrayManager } from './TrayManager';
import { useRooms } from 'renderer/apps/Rooms/useRooms';
import { AirliftManager } from './AirliftManager';
import { AppWindowManager } from './AppWindowManager';
import { AirliftDragManager } from './AirliftDragManager';

const DesktopPresenter = () => {
  const { ship, desktop } = useServices();
  useRooms(ship?.patp); // creates first instance of roomsManager

  return (
    <Fill>
      <Layer zIndex={15}>
        <TrayManager />
      </Layer>
      <Layer zIndex={0}>
        <AirliftManager />
        <AppWindowManager />
        <AirliftDragManager />
      </Layer>
      <Layer zIndex={1}>{desktop.isHomePaneOpen && <HomePane />}</Layer>
      <Layer zIndex={14}>
        <Bottom size={56}>
          <SystemBar />
        </Bottom>
      </Layer>
    </Fill>
  );
};

export const Desktop = observer(DesktopPresenter);
