import { Bottom, Fill, Layer } from 'react-spaces';
import { observer } from 'mobx-react';

import { useAppState } from 'renderer/stores/app.store';

import { AppWindowManager } from './AppWindowManager';
import { HomePane } from './components/Home/HomePane';
import { SystemBar } from './components/SystemBar/SystemBar';
import { TrayManager } from './TrayManager';
import { useDeeplink } from './useDeeplink';
import { useMultiplayer } from './useMultiplayer';

const DesktopPresenter = () => {
  const { shellStore, authStore } = useAppState();
  const { session } = authStore;

  useDeeplink();

  useMultiplayer({
    patp: session?.serverId,
    shipColor: session?.color ?? '#000000',
    desktopDimensions: shellStore.desktopDimensions,
    isMultiplayerEnabled: shellStore.multiplayerEnabled,
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
