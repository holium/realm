import { observer } from 'mobx-react';
import { Bottom, Layer, Fill } from 'react-spaces';
import { SystemBar } from './components/SystemBar/SystemBar';
import { AppWindowManager } from './AppWindowManager';
import { HomePane } from './components/Home/HomePane';
import { TrayManager } from './TrayManager';
import { useRooms } from 'renderer/apps/Rooms/useRooms';
import { useMultiplayer } from './useMultiplayer';
import { useAppState } from 'renderer/stores/app.store';

const DesktopPresenter = () => {
  const { authStore, shellStore } = useAppState();
  const { session } = authStore;
  const roomsManager = useRooms(session?.patp);

  useMultiplayer({
    patp: session?.patp,
    shipColor: session?.color ?? '#000000',
    desktopDimensions: shellStore.desktopDimensions,
    isMultiplayerEnabled: shellStore.multiplayerEnabled,
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
      <Layer zIndex={16}>{shellStore.isHomePaneOpen && <HomePane />}</Layer>
      <Layer zIndex={14}>
        <Bottom size={56}>
          <SystemBar />
        </Bottom>
      </Layer>
    </Fill>
  );
};

export const Desktop = observer(DesktopPresenter);
