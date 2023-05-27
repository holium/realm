import { useEffect, useMemo, useState } from 'react';
import { Reorder } from 'framer-motion';
import { observer } from 'mobx-react';

import { useToggle, UseToggleHook } from '@holium/design-system';
import { TileHighlight } from '@holium/design-system/os';

import { Bookmark } from 'os/services/ship/spaces/tables/bookmarks.table';
import { ContextMenuOption, useContextMenu } from 'renderer/components';
import { useAppState } from 'renderer/stores/app.store';
import { SpacesIPC } from 'renderer/stores/ipc';

import { WebAppTile } from './WebAppTile';

type Props = Bookmark & {
  canClick: UseToggleHook;
};

const PinnedWebAppPresenter = ({
  path,
  url,
  title,
  color,
  favicon: initialFavicon,
  canClick,
}: Props) => {
  const { shellStore } = useAppState();
  const { getOptions, setOptions } = useContextMenu();

  const [favicon, setFavicon] = useState<string | null>(initialFavicon);

  const window = shellStore.getWindowByAppId(url);
  const isActive = window?.isActive;

  const tapping = useToggle(false);
  const tileId = useMemo(() => `pinned-web-app-${url}`, [url]);

  const contextMenuOptions = useMemo(
    () =>
      [
        {
          id: 'unpin-web-app',
          label: 'Unpin',
          onClick: () => SpacesIPC.removeBookmark(path, url),
        },
        window && {
          id: window.isMinimized ? 'show-web-app' : 'hide-web-app',
          label: window.isMinimized ? 'Show' : 'Hide',
          section: 1,
          onClick: () => shellStore.toggleMinimized(url),
        },
        window && {
          id: 'close-web-app',
          label: 'Close',
          section: 1,
          onClick: () => shellStore.closeWindow(url),
        },
      ].filter(Boolean) as ContextMenuOption[],
    [path, url, window?.isMinimized, shellStore]
  );

  const onClick = () => {
    const appWindow = shellStore.getWindowByAppId(url);

    if (appWindow) {
      if (appWindow.isMinimized) {
        shellStore.toggleMinimized(url);
      } else {
        if (!appWindow.isActive) {
          shellStore.setActive(url);
        } else {
          shellStore.toggleMinimized(url);
        }
      }
    } else {
      if (canClick.isOn) {
        shellStore.openBookmark({
          path,
          url,
          title,
          color,
        });
        shellStore.closeHomePane();
      }
    }
  };

  useEffect(() => {
    if (contextMenuOptions !== getOptions(tileId)) {
      setOptions(tileId, contextMenuOptions);
    }
  }, [contextMenuOptions, tileId]);

  return (
    <Reorder.Item key={url} value={url} onDragStart={() => tapping.toggleOff()}>
      <WebAppTile
        tileId={tileId}
        size={32}
        borderRadius={4}
        backgroundColor={color}
        favicon={favicon}
        letter={title.slice(0, 1).toUpperCase()}
        onClick={onClick}
        onFaultyFavicon={() => setFavicon(null)}
        tapping={tapping}
      >
        <TileHighlight
          layoutId={`tile-highlight-${tileId}`}
          isOpen={Boolean(window)}
          isActive={Boolean(isActive)}
          transition={{ duration: 0.2 }}
        />
      </WebAppTile>
    </Reorder.Item>
  );
};

export const PinnedWebApp = observer(PinnedWebAppPresenter);
