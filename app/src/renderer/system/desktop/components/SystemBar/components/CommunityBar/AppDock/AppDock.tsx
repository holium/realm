import { useCallback, useState } from 'react';
import { toJS } from 'mobx';
import { observer } from 'mobx-react';
import { lighten, rgba } from 'polished';
import { Reorder } from 'framer-motion';
import { Flex, Divider } from 'renderer/components';
import { AppType, NewBazaarStoreType } from 'os/services/spaces/models/bazaar';
import { useServices } from 'renderer/logic/store';
import { SpacesActions } from 'renderer/logic/actions/spaces';
import { DesktopActions } from 'renderer/logic/actions/desktop';
import { DesktopStoreType } from 'os/services/shell/desktop.model';
import { PinnedDockApp } from './PinnedDockApp';
import { UnpinnedDockApp } from './UnpinnedDockApp';
import { ThemeStoreType } from 'renderer/logic/theme';

type Props = {
  dockAppIds: string[];
  pinnedDockApps: AppType[];
  unpinnedDockApps: AppType[];
  spacePath: string;
  desktop: DesktopStoreType;
  bazaar: NewBazaarStoreType;
  theme: ThemeStoreType;
};

const AppDockPresenterView = ({
  dockAppIds,
  pinnedDockApps,
  unpinnedDockApps,
  spacePath,
  desktop,
  bazaar,
  theme,
}: Props) => {
  const [localDockAppIds, setLocalDockAppIds] = useState(dockAppIds);

  const onClickDockedApp = useCallback((dockedApp: AppType) => {
    const window = desktop.getWindowByAppId(dockedApp.id);
    if (window) {
      if (window.isMinimized) {
        DesktopActions.toggleMinimized(dockedApp.id);
      }
      DesktopActions.setActive(dockedApp.id);
    } else {
      DesktopActions.openAppWindow(dockedApp);
    }
  }, []);

  const onOrderUpdate = useCallback(() => {
    // First we update the dock locally so the user doesn't have to
    // wait for the subscription to come back from Hoon side.
    bazaar.setDock(spacePath, localDockAppIds);
    SpacesActions.setPinnedOrder(spacePath, toJS(localDockAppIds));
  }, [localDockAppIds]);

  const pinnedAppTiles = pinnedDockApps.map((app) => {
    const window = desktop.getWindowByAppId(app.id);
    const pinnedTileId = `pinned-${app.id}-${spacePath}`;

    return (
      <PinnedDockApp
        key={`tile-${pinnedTileId}`}
        tileId={pinnedTileId}
        app={app}
        spacePath={spacePath}
        isOpen={Boolean(window)}
        isSelected={Boolean(window?.isActive)}
        onClick={onClickDockedApp}
      />
    );
  });

  const unpinnedAppTiles = unpinnedDockApps.map((app, index) => {
    const window = desktop.getWindowByAppId(app.id);
    const unpinnedTileId = `unpinned-${app.id}-${spacePath}-${index}`;

    return (
      <UnpinnedDockApp
        key={`tile-${unpinnedTileId}`}
        tileId={unpinnedTileId}
        app={app}
        spacePath={spacePath}
        isSelected={Boolean(window?.isActive)}
        onClick={onClickDockedApp}
      />
    );
  });

  const showDivider = pinnedDockApps.length > 0 && unpinnedDockApps.length > 0;

  return (
    <Flex position="relative" flexDirection="row" alignItems="center">
      <Reorder.Group
        key={`dock-${spacePath}`}
        axis="x"
        style={{
          display: 'flex',
          position: 'relative',
          flexDirection: 'row',
          gap: 8,
        }}
        values={localDockAppIds}
        onMouseUp={onOrderUpdate}
        onReorder={setLocalDockAppIds}
      >
        {pinnedAppTiles}
      </Reorder.Group>
      {showDivider && (
        <Divider
          key={`dock-divider-${spacePath}`}
          ml={2}
          mr={2}
          customBg={rgba(lighten(0.2, theme.currentTheme.dockColor), 0.4)}
        />
      )}
      <Flex position="relative" flexDirection="row" alignItems="center" gap={8}>
        {unpinnedAppTiles}
      </Flex>
    </Flex>
  );
};

const AppDockPresenter = () => {
  const { desktop, spaces, bazaar, theme } = useServices();

  const spacePath = spaces.selected?.path;
  const dockAppIds: string[] = spacePath ? bazaar.getDock(spacePath) ?? [] : [];
  const pinnedDockApps = spacePath
    ? ((bazaar.getDockApps(spacePath) ?? []).filter(Boolean) as AppType[])
    : [];
  const unpinnedDockApps = desktop.openWindows
    .filter(({ appId }) => !dockAppIds.includes(appId))
    .map(({ appId }) => bazaar.getApp(appId))
    .filter(Boolean) as AppType[];

  if (!spacePath) return null;

  return (
    <AppDockPresenterView
      dockAppIds={dockAppIds}
      pinnedDockApps={pinnedDockApps}
      unpinnedDockApps={unpinnedDockApps}
      spacePath={spacePath}
      desktop={desktop}
      bazaar={bazaar}
      theme={theme}
    />
  );
};

export const AppDock = observer(AppDockPresenter);
