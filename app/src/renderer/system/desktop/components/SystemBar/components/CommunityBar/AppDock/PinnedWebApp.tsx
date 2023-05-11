import { useEffect, useMemo, useState } from 'react';
import { Reorder } from 'framer-motion';
import { observer } from 'mobx-react';

import { Flex } from '@holium/design-system/general';

import { ContextMenuOption, useContextMenu } from 'renderer/components';
import { useAppState } from 'renderer/stores/app.store';
import { SpacesIPC } from 'renderer/stores/ipc';
import { useShipStore } from 'renderer/stores/ship.store';

const getFavicon = (url: string) => {
  const { protocol, host } = new URL(url);

  return `${protocol}//${host}/favicon.ico`;
};

type Props = {
  url: string;
};

const PinnedWebAppPresenter = ({ url }: Props) => {
  const { shellStore } = useAppState();
  const { spacesStore } = useShipStore();

  const [favicon, setFavicon] = useState<string | null>(getFavicon(url));
  const { getOptions, setOptions } = useContextMenu();

  // First uppercase letter of the website name.
  // Remove any protocol and www. from the url.
  const character = url
    .replace(/(^\w+:|^)\/\//, '')
    .replace('www.', '')
    .substring(0, 1)
    .toUpperCase();

  const tileId = useMemo(() => `pinned-web-app-${url}`, [url]);
  const spacePath = useMemo(
    () => spacesStore.selected?.path,
    [spacesStore.selected]
  );

  const contextMenuOptions: ContextMenuOption[] = useMemo(
    () => [
      {
        id: 'unpin-web-app',
        label: 'Unpin',
        onClick: () => {
          spacePath && SpacesIPC.removeBookmark(spacePath, url);
        },
      },
    ],
    [spacePath, url]
  );

  const onClick = () => {
    const appWindow = shellStore.getWindowByAppId(url);

    if (appWindow) {
      if (appWindow.isMinimized) {
        shellStore.toggleMinimized(url);
      } else {
        shellStore.setActive(url);
      }
    } else {
      shellStore.openWebApp(url);
    }
    shellStore.closeHomePane();

  };

  useEffect(() => {
    if (contextMenuOptions !== getOptions(tileId)) {
      setOptions(tileId, contextMenuOptions);
    }
  }, [contextMenuOptions, getOptions, setOptions, tileId]);

  return (
    <Reorder.Item key={url} value={url}>
      <Flex
        id={tileId}
        style={{
          width: 32,
          height: 32,
          borderRadius: 4,
          color: '#fff',
          backgroundColor: '#92D4F9',
          alignItems: 'center',
          justifyContent: 'center',
          userSelect: 'none',
        }}
        onClick={onClick}
      >
        {favicon ? (
          <img
            alt="favicon"
            src={favicon}
            style={{
              width: 16,
              height: 16,
              borderRadius: 4,
              pointerEvents: 'none',
            }}
            onError={() => setFavicon(null)}
          />
        ) : (
          character
        )}
      </Flex>
    </Reorder.Item>
  );
};

export const PinnedWebApp = observer(PinnedWebAppPresenter);
