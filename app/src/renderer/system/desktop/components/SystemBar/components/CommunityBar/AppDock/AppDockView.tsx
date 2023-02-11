import { useCallback, useState } from 'react';
import { toJS } from 'mobx';
import { observer } from 'mobx-react';
import { lighten, rgba } from 'polished';
import { Reorder } from 'framer-motion';
import { Flex, Divider } from 'renderer/components';
import { AppType } from 'os/services/spaces/models/bazaar';
import { useServices } from 'renderer/logic/store';
import { SpacesActions } from 'renderer/logic/actions/spaces';
import { DesktopActions } from 'renderer/logic/actions/desktop';
import { PinnedDockApp } from './PinnedDockApp';
import { UnpinnedDockApp } from './UnpinnedDockApp';

type Props = {
  spacePath: string;
  pinnedDockAppsOrder: string[];
  pinnedDockApps: AppType[];
  unpinnedDockApps: AppType[];
};

const AppDockViewPresenter = ({
  spacePath,
  pinnedDockAppsOrder,
  pinnedDockApps,
  unpinnedDockApps,
}: Props) => {
  const { desktop, bazaar, theme } = useServices();

  const [localDockAppIds, setLocalDockAppIds] = useState(pinnedDockAppsOrder);

  const onClickDockedApp = useCallback((dockedApp: AppType) => {
    const appWindow = desktop.getWindowByAppId(dockedApp.id);
    if (appWindow) {
      if (appWindow.isMinimized) {
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
    const appWindow = desktop.getWindowByAppId(app.id);
    const pinnedTileId = `pinned-${app.id}-${spacePath}`;

    return (
      <PinnedDockApp
        key={`tile-${pinnedTileId}`}
        tileId={pinnedTileId}
        app={app}
        spacePath={spacePath}
        hasWindow={Boolean(appWindow)}
        isActive={Boolean(appWindow?.isActive)}
        isMinimized={Boolean(appWindow?.isMinimized)}
        onClick={onClickDockedApp}
      />
    );
  });

  const unpinnedAppTiles = unpinnedDockApps.map((app, index) => {
    const appWindow = desktop.getWindowByAppId(app.id);
    const unpinnedTileId = `unpinned-${app.id}-${spacePath}-${index}`;

    return (
      <UnpinnedDockApp
        key={`tile-${unpinnedTileId}`}
        tileId={unpinnedTileId}
        app={app}
        spacePath={spacePath}
        isActive={Boolean(appWindow?.isActive)}
        isMinimized={Boolean(appWindow?.isMinimized)}
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

export const AppDockView = observer(AppDockViewPresenter);
