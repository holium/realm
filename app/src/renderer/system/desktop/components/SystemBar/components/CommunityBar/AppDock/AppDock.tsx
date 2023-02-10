import { useCallback, useMemo } from 'react';
import { toJS } from 'mobx';
import { observer } from 'mobx-react';
import { lighten, rgba } from 'polished';
import { Reorder, AnimatePresence } from 'framer-motion';
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
  setDockAppIds: (appIds: string[]) => void;
};

const AppDockPresenterView = ({
  dockAppIds,
  pinnedDockApps,
  unpinnedDockApps,
  spacePath,
  desktop,
  bazaar,
  theme,
  setDockAppIds,
}: Props) => {
  const showDivider = useMemo(
    () => pinnedDockApps.length > 0 && unpinnedDockApps.length > 0,
    [pinnedDockApps, unpinnedDockApps]
  );

  const onClickDockedApp = useCallback((dockedApp: AppType) => {
    const window = desktop.getWindowByAppId(dockedApp.id);
    if (window) {
      if (window.isMinimized) {
        DesktopActions.toggleMinimized(dockedApp.id);
      } else {
        DesktopActions.setActive(dockedApp.id);
      }
    } else {
      DesktopActions.openAppWindow(toJS(dockedApp));
    }
  }, []);

  const pinnedAppTiles = useMemo(
    () =>
      pinnedDockApps.map((app, index) => {
        const window = desktop.getWindowByAppId(app.id);
        const pinnedTileId = `pinned-${app.id}-${spacePath}-${index}`;

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
      }),
    [pinnedDockApps, desktop, spacePath]
  );

  const unpinnedAppTiles = useMemo(
    () =>
      unpinnedDockApps.map((app, index) => {
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
      }),
    [unpinnedDockApps, bazaar, spacePath]
  );

  return (
    <Flex position="relative" flexDirection="row" alignItems="center">
      <AnimatePresence>
        <Reorder.Group
          key={`dock-${spacePath}`}
          axis="x"
          style={{
            display: 'flex',
            position: 'relative',
            flexDirection: 'row',
            gap: 8,
          }}
          values={dockAppIds}
          onReorder={(newOrder: string[]) => {
            // First we update the dock locally so the user doesn't have to
            // wait for the subscription to come back.
            setDockAppIds(newOrder);
            SpacesActions.setPinnedOrder(spacePath, newOrder);
          }}
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
        <Flex
          position="relative"
          flexDirection="row"
          alignItems="center"
          gap={8}
        >
          {unpinnedAppTiles}
        </Flex>
      </AnimatePresence>
    </Flex>
  );
};

const AppDockPresenter = () => {
  const { desktop, spaces, bazaar, theme } = useServices();

  const spacePath = spaces.selected?.path;
  const dockAppIds: string[] = spacePath ? bazaar.getDock(spacePath) ?? [] : [];
  const dockApps = spacePath
    ? ((bazaar.getDockApps(spacePath) ?? []) as AppType[])
    : [];
  const pinnedDockApps = dockApps.filter(Boolean);
  const unpinnedDockApps = desktop.openWindows
    .filter((appWindow) => !dockAppIds.includes(appWindow.appId))
    .map((appWindow) => bazaar.getApp(appWindow.appId))
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
      setDockAppIds={(appIds) => bazaar.setDock(spacePath, appIds)}
    />
  );
};

export const AppDock = observer(AppDockPresenter);
