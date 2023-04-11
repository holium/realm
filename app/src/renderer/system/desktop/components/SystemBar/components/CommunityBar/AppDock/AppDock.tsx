import { observer } from 'mobx-react';
import { AppType } from 'os/services/spaces/models/bazaar';
import { useAppState } from 'renderer/stores/app.store';
import { useShipStore } from 'renderer/stores/ship.store';
import { AppDockView } from './AppDockView';

const AppDockPresenter = () => {
  const { shellStore } = useAppState();
  const { spacesStore, bazaarStore } = useShipStore();

  const spacePath = spacesStore.selected?.path;
  const pinnedDockAppsOrder = spacePath
    ? spacesStore.selected?.getDock() ?? []
    : [];
  const pinnedDockApps = spacePath
    ? ((spacesStore.selected?.getDockApps() ?? []).filter(Boolean) as AppType[])
    : [];
  const unpinnedDockApps = shellStore.openWindows
    .filter(({ appId }) => !pinnedDockAppsOrder.includes(appId))
    .filter(
      ({ appId }, index, self) =>
        self.findIndex(({ appId: id }) => id === appId) === index
    )
    .map(({ appId }) => bazaarStore.getApp(appId))
    .filter(Boolean) as AppType[];

  if (!spacePath) return null;

  return (
    <AppDockView
      spacePath={spacePath}
      pinnedDockAppsOrder={pinnedDockAppsOrder}
      pinnedDockApps={pinnedDockApps}
      unpinnedDockApps={unpinnedDockApps}
    />
  );
};

export const AppDock = observer(AppDockPresenter);
