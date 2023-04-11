import { useCallback, useState } from 'react';
import { toJS } from 'mobx';
import { observer } from 'mobx-react';
import { lighten, rgba } from 'polished';
import { Reorder } from 'framer-motion';
import { Flex, Divider } from 'renderer/components';
import { AppType } from 'os/services/spaces/models/bazaar';
import { SpacesActions } from 'renderer/logic/actions/spaces';
import { PinnedDockApp } from './PinnedDockApp';
import { UnpinnedDockApp } from './UnpinnedDockApp';
import { useAppState } from 'renderer/stores/app.store';
import { useShipStore } from 'renderer/stores/ship.store';

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
  const { shellStore, theme } = useAppState();
  const { spacesStore } = useShipStore();

  const [localDockAppIds, setLocalDockAppIds] = useState(pinnedDockAppsOrder);

  const onClickDockedApp = useCallback((dockedApp: AppType) => {
    const appWindow = shellStore.getWindowByAppId(dockedApp.id);
    if (appWindow) {
      if (appWindow.isMinimized) {
        shellStore.toggleMinimized(dockedApp.id);
      } else {
        shellStore.setActive(dockedApp.id);
      }
    } else {
      shellStore.openWindow(dockedApp);
    }
    shellStore.closeHomePane();
  }, []);

  const onOrderUpdate = useCallback(() => {
    // First we update the dock locally so the user doesn't have to
    // wait for the subscription to come back from Hoon side.
    spacesStore.selected?.reorderPinnedApps(localDockAppIds);
  }, [localDockAppIds]);

  const pinnedAppTiles = pinnedDockApps.map((app) => {
    const appWindow = shellStore.getWindowByAppId(app.id);
    const pinnedTileId = `pinned-${app.id}-${spacePath}`;

    return (
      <PinnedDockApp
        key={`tile-${pinnedTileId}`}
        tileId={pinnedTileId}
        app={app}
        space={spacesStore.selected}
        hasWindow={Boolean(appWindow)}
        isActive={Boolean(appWindow?.isActive)}
        isMinimized={Boolean(appWindow?.isMinimized)}
        onClick={onClickDockedApp}
      />
    );
  });

  const unpinnedAppTiles = unpinnedDockApps.map((app, index) => {
    const appWindow = shellStore.getWindowByAppId(app.id);
    const unpinnedTileId = `unpinned-${app.id}-${spacePath}-${index}`;

    return (
      <UnpinnedDockApp
        key={`tile-${unpinnedTileId}`}
        tileId={unpinnedTileId}
        app={app}
        space={spacesStore.selected}
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
          customBg={rgba(lighten(0.2, theme.dockColor), 0.4)}
        />
      )}
      <Flex position="relative" flexDirection="row" alignItems="center" gap={8}>
        {unpinnedAppTiles}
      </Flex>
    </Flex>
  );
};

export const AppDockView = observer(AppDockViewPresenter);
