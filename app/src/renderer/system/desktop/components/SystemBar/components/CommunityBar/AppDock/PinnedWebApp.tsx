import { useEffect, useMemo, useState } from 'react';
import { Reorder } from 'framer-motion';
import { observer } from 'mobx-react';

import { Text } from '@holium/design-system/general';
import { TileHighlight } from '@holium/design-system/os';

import { Bookmark } from 'os/services/ship/spaces/tables/bookmarks.table';
import { ContextMenuOption, useContextMenu } from 'renderer/components';
import { useAppState } from 'renderer/stores/app.store';
import { SpacesIPC } from 'renderer/stores/ipc';

import { WebAppTile } from './WebAppTile';

type Props = Bookmark & {
  isGrid?: boolean;
};

const PinnedWebAppPresenter = ({
  path,
  url,
  title,
  color,
  favicon: initialFavicon,
  isGrid,
}: Props) => {
  const { shellStore } = useAppState();
  const { getOptions, setOptions } = useContextMenu();

  const [favicon, setFavicon] = useState<string | null>(initialFavicon);

  const window = shellStore.getWindowByAppId(url);
  const isActive = window?.isActive;

  const tileId = useMemo(() => `pinned-web-app-${url}`, [url]);

  const contextMenuOptions: ContextMenuOption[] = useMemo(
    () => [
      {
        id: 'unpin-web-app',
        label: 'Unpin',
        onClick: () => {
          SpacesIPC.removeBookmark(path, url);
        },
      },
    ],
    [path, url]
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
      shellStore.openBookmark({
        path,
        url,
        title,
        color,
      });
    }
    shellStore.closeHomePane();
  };

  useEffect(() => {
    if (contextMenuOptions !== getOptions(tileId)) {
      setOptions(tileId, contextMenuOptions);
    }
  }, [contextMenuOptions, tileId]);

  if (isGrid) {
    return (
      <WebAppTile
        tileId={tileId}
        size={196}
        borderRadius={24}
        backgroundColor={color}
        boxShadow="var(--rlm-box-shadow-2)"
        favicon={favicon}
        letter={title.slice(0, 1).toUpperCase()}
        onClick={onClick}
        onFaultyFavicon={() => setFavicon(null)}
      >
        <Text.Custom
          position="absolute"
          left="1.5rem"
          bottom="1.25rem"
          fontWeight={500}
          fontSize={2}
          style={{
            pointerEvents: 'none',
            color: 'rgba(51, 51, 51, 0.8)',
          }}
        >
          {title}
        </Text.Custom>
      </WebAppTile>
    );
  }

  return (
    <Reorder.Item key={url} value={url}>
      <WebAppTile
        tileId={tileId}
        size={32}
        borderRadius={4}
        backgroundColor={color}
        favicon={favicon}
        letter={title.slice(0, 1).toUpperCase()}
        onClick={onClick}
        onFaultyFavicon={() => setFavicon(null)}
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
