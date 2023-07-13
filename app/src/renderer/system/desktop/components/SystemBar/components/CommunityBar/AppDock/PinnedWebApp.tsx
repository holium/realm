import { useEffect, useMemo, useRef, useState } from 'react';
import { Reorder } from 'framer-motion';
import { observer } from 'mobx-react';

import { TileHighlight } from '@holium/design-system/os';
import { useToggle } from '@holium/design-system/util';

import { Bookmark } from 'os/services/ship/spaces/tables/bookmarks.table';
import { ContextMenuOption, useContextMenu } from 'renderer/components';
import { useAppState } from 'renderer/stores/app.store';
import { SpacesIPC } from 'renderer/stores/ipc';

import { WebAppTile } from './WebAppTile';

type Props = Bookmark;

const PinnedWebAppPresenter = ({
  path,
  url,
  title,
  color,
  favicon: initialFavicon,
}: Props) => {
  const { shellStore } = useAppState();
  const pointerDownRef = useRef<{
    tileId: string;
    rect: DOMRect;
  } | null>(null);
  const { getOptions, setOptions, getColors, setColors, mouseRef } =
    useContextMenu();

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

  const contextMenuColors = useMemo(() => {
    return { textColor: 'rgba(51, 51, 51, 0.8)', backgroundColor: '#fff' };
  }, []);

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
      shellStore.closeHomePane();
    }
  };

  useEffect(() => {
    if (!mouseRef) tapping.toggleOff();
  }, [mouseRef]);

  useEffect(() => {
    if (contextMenuOptions !== getOptions(tileId)) {
      setOptions(tileId, contextMenuOptions);
    }

    if (contextMenuColors !== getColors(tileId)) {
      setColors(tileId, contextMenuColors);
    }
  }, [contextMenuOptions, tileId]);

  return (
    <Reorder.Item
      key={url}
      value={url}
      onDragStart={() => tapping.toggleOff()}
      onPointerDown={() => {
        const rect = document.getElementById(tileId)?.getBoundingClientRect();
        if (rect) pointerDownRef.current = { tileId, rect };
        tapping.toggleOn();
      }}
      onPointerUp={(e) => {
        // Make sure it's a left click.
        if (e.button !== 0) return;

        if (tileId !== pointerDownRef.current?.tileId) return;

        tapping.toggleOff();

        const pointerDownRect = pointerDownRef.current?.rect;
        const pointerUpRect = document
          .getElementById(tileId)
          ?.getBoundingClientRect();

        if (!pointerDownRect || !pointerUpRect) return;

        const diffX = Math.abs(pointerDownRect.x - pointerUpRect.x);
        const diffY = Math.abs(pointerDownRect.y - pointerUpRect.y);

        if (diffX === 0 && diffY === 0) onClick();
      }}
    >
      <WebAppTile
        tileId={tileId}
        size={32}
        borderRadius={4}
        backgroundColor={color}
        favicon={favicon}
        letter={title.slice(0, 1).toUpperCase()}
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
