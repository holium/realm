import { observer } from 'mobx-react';
import { AppType } from 'os/services/spaces/models/bazaar';
import { useServices } from 'renderer/logic/store';
import { AppDockView } from './AppDockView';

const AppDockPresenter = () => {
  const { desktop, spaces, bazaar } = useServices();

  const spacePath = spaces.selected?.path;
  const pinnedDockAppsOrder = spacePath ? bazaar.getDock(spacePath) ?? [] : [];
  const pinnedDockApps = spacePath
    ? ((bazaar.getDockApps(spacePath) ?? []).filter(Boolean) as AppType[])
    : [];
  const unpinnedDockApps = desktop.openWindows
    .filter(({ appId }) => !pinnedDockAppsOrder.includes(appId))
    .filter(
      ({ appId }, index, self) =>
        self.findIndex(({ appId: id }) => id === appId) === index
    )
    .map(({ appId }) => bazaar.getApp(appId))
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
