import { useCallback, useEffect, useMemo, useState } from 'react';
import { debounce } from 'lodash';
import { Flex, Divider } from 'renderer/components';
import { AppType, NewBazaarStoreType } from 'os/services/spaces/models/bazaar';
import { toJS } from 'mobx';
import { observer } from 'mobx-react';
import { lighten, rgba } from 'polished';
import { Reorder, AnimatePresence } from 'framer-motion';
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
      pinnedDockApps.map((app) => {
        const window = desktop.getWindowByAppId(app.id);

        return (
          <PinnedDockApp
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
      unpinnedDockApps.map((app) => {
        const window = desktop.getWindowByAppId(app.id);

        return (
          <UnpinnedDockApp
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
          axis="x"
          style={{
            position: 'relative',
            display: 'flex',
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

        {pinnedAppTiles.length > 0 && unpinnedAppTiles.length > 0 && (
          <Divider
            key={`app-dock-divider-${spacePath}`}
            customBg={rgba(lighten(0.2, theme.currentTheme.dockColor), 0.4)}
            ml={2}
            mr={2}
          />
        )}
      </AnimatePresence>
      <Flex position="relative" flexDirection="row" gap={8} alignItems="center">
        {unpinnedAppTiles}
      </Flex>
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

  const [localDockAppIds, setLocalDockAppIds] = useState<string[]>(dockAppIds);

  const debouncedSetLocalDockApps = useCallback(
    debounce(setLocalDockAppIds, 500),
    []
  );

  useEffect(() => {
    // If the dock length changes, e.g. from the AppGrid, we update the local dock.
    debouncedSetLocalDockApps(dockAppIds);
  }, [dockApps.length]);

  if (!spacePath) return null;

  return (
    <AppDockPresenterView
      dockAppIds={localDockAppIds}
      pinnedDockApps={pinnedDockApps}
      unpinnedDockApps={unpinnedDockApps}
      spacePath={spacePath}
      desktop={desktop}
      bazaar={bazaar}
      theme={theme}
      setDockAppIds={setLocalDockAppIds}
    />
  );
};

export const AppDock = observer(AppDockPresenter);
