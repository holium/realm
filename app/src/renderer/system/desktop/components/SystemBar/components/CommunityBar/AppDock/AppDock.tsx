import { observer } from 'mobx-react';
import { useAppState } from 'renderer/stores/app.store';
import { AppMobxType } from 'renderer/stores/models/bazaar.model';
import { useShipStore } from 'renderer/stores/ship.store';

import { AppDockView } from './AppDockView';

const AppDockPresenter = () => {
  const { shellStore } = useAppState();
  const { spacesStore, bazaarStore } = useShipStore();

  const currentSpace = spacesStore.selected;
  const pinnedDockApps = currentSpace?.dock || [];
  const unpinnedDockApps = shellStore.openWindows
    .filter(({ appId }) => !currentSpace?.isPinned(appId))
    .filter(
      ({ appId }, index, self) =>
        self.findIndex(({ appId: id }) => id === appId) === index
    )
    .map(({ appId }) => bazaarStore.getApp(appId))
    .filter(Boolean) as AppMobxType[];

  if (!currentSpace) return null;

  return (
    <AppDockView
      spacePath={currentSpace.path}
      pinnedDockApps={pinnedDockApps}
      unpinnedDockApps={unpinnedDockApps}
    />
  );
};

export const AppDock = observer(AppDockPresenter);
