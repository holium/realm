import { Bottom, Fill, Layer } from 'react-spaces';
import { observer } from 'mobx-react';

import { useAppState } from 'renderer/stores/app.store';

import { AppWindowManager } from './AppWindowManager';
import { HomePane } from './components/Home/HomePane';
import { SystemBar } from './components/SystemBar/SystemBar';
import { TrayManager } from './TrayManager';

const DesktopPresenter = () => {
  const { authStore, shellStore } = useAppState();
  const { session } = authStore;
  const roomsManager = undefined;

  // useMultiplayer({
  //   patp: session?.patp,
  //   shipColor: session?.color ?? '#000000',
  //   desktopDimensions: shellStore.desktopDimensions,
  //   isMultiplayerEnabled: shellStore.multiplayerEnabled,
  //   roomsManager,
  // });

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
