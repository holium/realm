import { useCallback } from 'react';
import { Reorder } from 'framer-motion';
import { observer } from 'mobx-react';
import { lighten, rgba } from 'polished';

import { useToggle } from '@holium/design-system';
import { Flex } from '@holium/design-system/general';

import { Bookmark } from 'os/services/ship/spaces/tables/bookmarks.table';
import { Divider } from 'renderer/components';
import { useAppState } from 'renderer/stores/app.store';
import { AppMobxType } from 'renderer/stores/models/bazaar.model';
import { SpaceModelType } from 'renderer/stores/models/spaces.model';

import { PinnedDockApp } from './PinnedDockApp';
import { PinnedWebApp } from './PinnedWebApp';
import { UnpinnedDockApp } from './UnpinnedDockApp';

type Props = {
  currentSpace: SpaceModelType;
  pinnedDockApps: AppMobxType[];
  unpinnedDockApps: AppMobxType[];
  bookmarks: Bookmark[];
};

const AppDockViewPresenter = ({
  currentSpace,
  pinnedDockApps,
  unpinnedDockApps,
  bookmarks,
}: Props) => {
  const { shellStore, theme } = useAppState();

  const onClickDockedApp = useCallback((dockedApp: AppMobxType) => {
    const appWindow = shellStore.getWindowByAppId(dockedApp.id);
    if (appWindow) {
      if (appWindow.isMinimized) {
        shellStore.toggleMinimized(dockedApp.id);
      } else {
        if (!appWindow.isActive) {
          shellStore.setActive(dockedApp.id);
        } else {
          shellStore.toggleMinimized(dockedApp.id);
        }
      }
    } else {
      shellStore.openWindow(dockedApp);
    }
    shellStore.closeHomePane();
  }, []);

  const pinnedAppTiles = pinnedDockApps.map((app) => {
    const appWindow = shellStore.getWindowByAppId(app.id);
    const pinnedTileId = `pinned-${app.id}-${currentSpace.path}`;

    return (
      <PinnedDockApp
        key={`tile-${pinnedTileId}`}
        tileId={pinnedTileId}
        app={app}
        space={currentSpace}
        hasWindow={Boolean(appWindow)}
        isActive={Boolean(appWindow?.isActive)}
        isMinimized={Boolean(appWindow?.isMinimized)}
        onClick={onClickDockedApp}
      />
    );
  });
  const canClick = useToggle(true);

  const pinnedWebApps = bookmarks.map((bookmark) => (
    <PinnedWebApp
      key={`pinned-${bookmark.url}`}
      {...bookmark}
      canClick={canClick}
    />
  ));

  const unpinnedAppTiles = unpinnedDockApps.map((app, index) => {
    const appWindow = shellStore.getWindowByAppId(app.id);
    const unpinnedTileId = `unpinned-${app.id}-${currentSpace.path}-${index}`;

    return (
      <UnpinnedDockApp
        key={`tile-${unpinnedTileId}`}
        tileId={unpinnedTileId}
        app={app}
        space={currentSpace}
        isActive={Boolean(appWindow?.isActive)}
        isMinimized={Boolean(appWindow?.isMinimized)}
        onClick={onClickDockedApp}
      />
    );
  });

  const showPinnedAppDivider = Boolean(
    pinnedDockApps.length && unpinnedDockApps.length
  );
  const showPinnedWebAppDivider = Boolean(
    (pinnedDockApps.length || unpinnedDockApps.length) && pinnedWebApps.length
  );

  return (
    <Flex position="relative" flexDirection="row" alignItems="center">
      <Reorder.Group
        key={`dock-${currentSpace.path}`}
        axis="x"
        style={{
          display: 'flex',
          position: 'relative',
          gap: 8,
        }}
        values={currentSpace?.dockAppIds || []}
        onReorder={(apps: string[]) => currentSpace.reorderPinnedApps(apps)}
      >
        {pinnedAppTiles}
      </Reorder.Group>
      {showPinnedAppDivider && (
        <Divider
          key={`pinned-app-divider-${currentSpace.path}`}
          ml={2}
          mr={2}
          customBg={rgba(lighten(0.2, theme.dockColor), 0.4)}
        />
      )}
      <Flex position="relative" flexDirection="row" alignItems="center" gap={8}>
        {unpinnedAppTiles}
      </Flex>
      {showPinnedWebAppDivider && (
        <Divider
          key={`pinned-web-app-divider-${currentSpace.path}`}
          ml={2}
          mr={2}
          customBg={rgba(lighten(0.2, theme.dockColor), 0.4)}
        />
      )}
      <Reorder.Group
        key={`web-app-dock-${currentSpace.path}`}
        axis="x"
        style={{
          display: 'flex',
          position: 'relative',
          gap: 8,
        }}
        values={currentSpace?.bookmarks.map((b) => b.url) || []}
        onReorder={(urls: string[]) => currentSpace.reorderBookmarks(urls)}
      >
        {pinnedWebApps}
      </Reorder.Group>
    </Flex>
  );
};

export const AppDockView = observer(AppDockViewPresenter);
