import { Bottom, Fill, Layer } from 'react-spaces';
import { observer } from 'mobx-react';
import { useRooms } from 'renderer/apps/Rooms/useRooms';
import { useServices } from 'renderer/logic/store';

import { HomePane } from './components/Home/HomePane';
import { SystemBar } from './components/SystemBar/SystemBar';
import { AppWindowManager } from './AppWindowManager';
import { TrayManager } from './TrayManager';
import { useMultiplayer } from './useMultiplayer';

const DesktopPresenter = () => {
  const { ship, shell, desktop } = useServices();
  const roomsManager = useRooms(ship?.patp);
  useMultiplayer({
    patp: ship?.patp,
    shipColor: ship?.color ?? '#000000',
    desktopDimensions: shell.desktopDimensions,
    isMultiplayerEnabled: desktop.multiplayerEnabled,
    roomsManager,
  });

  return (
    <Fill>
      <Layer zIndex={15}>
        <TrayManager />
      </Layer>
      <Layer zIndex={0}>
        <AppWindowManager />
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
