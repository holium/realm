import { ReactNode, useEffect, useMemo, useState } from 'react';
import { Reorder } from 'framer-motion';
import { observer } from 'mobx-react';

import { Flex, Text } from '@holium/design-system/general';
import { TileHighlight } from '@holium/design-system/os';
import { getSiteNameFromUrl } from '@holium/design-system/util';

import { ContextMenuOption, useContextMenu } from 'renderer/components';
import { useAppState } from 'renderer/stores/app.store';
import { SpacesIPC } from 'renderer/stores/ipc';
import { useShipStore } from 'renderer/stores/ship.store';

const getFavicon = (url: string) => {
  const { protocol, host } = new URL(url);

  return `${protocol}//${host}/favicon.ico`;
};

type WebAppTileProps = {
  tileId: string;
  size: number;
  borderRadius: number;
  boxShadow?: string;
  favicon: string | null;
  character: string;
  children?: ReactNode;
  onClick: () => void;
  onFaultyFavicon: () => void;
};

const WebAppTile = ({
  tileId,
  size,
  borderRadius,
  boxShadow,
  favicon,
  character,
  children,
  onClick,
  onFaultyFavicon,
}: WebAppTileProps) => (
  <Flex
    id={tileId}
    style={{
      position: 'relative',
      width: size,
      height: size,
      borderRadius,
      boxShadow,
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
          width: '50%',
          height: '50%',
          borderRadius: 4,
          pointerEvents: 'none',
        }}
        onError={onFaultyFavicon}
      />
    ) : (
      character
    )}
    {children}
  </Flex>
);

type Props = {
  url: string;
  isGrid?: boolean;
};

const PinnedWebAppPresenter = ({ url, isGrid }: Props) => {
  const { shellStore } = useAppState();
  const { spacesStore } = useShipStore();

  const [favicon, setFavicon] = useState<string | null>(getFavicon(url));
  const { getOptions, setOptions } = useContextMenu();

  const window = shellStore.getWindowByAppId(url);
  const isActive = window?.isActive;

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
  }, [contextMenuOptions, tileId]);

  if (isGrid) {
    return (
      <WebAppTile
        tileId={tileId}
        size={196}
        borderRadius={24}
        boxShadow="var(--rlm-box-shadow-2)"
        favicon={favicon}
        character={character}
        onClick={onClick}
        onFaultyFavicon={() => setFavicon(null)}
      >
        <Text.Custom
          position="absolute"
          style={{
            pointerEvents: 'none',
            color: 'rgba(51, 51, 51, 0.8)',
          }}
          left="1.5rem"
          bottom="1.25rem"
          fontWeight={500}
          fontSize={2}
        >
          {getSiteNameFromUrl(url)}
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
        favicon={favicon}
        character={character}
        onClick={onClick}
        onFaultyFavicon={() => setFavicon(null)}
      />
      <TileHighlight
        layoutId={`tile-highlight-${tileId}`}
        isOpen={Boolean(window)}
        isActive={Boolean(isActive)}
        transition={{ duration: 0.2 }}
      />
    </Reorder.Item>
  );
};

export const PinnedWebApp = observer(PinnedWebAppPresenter);
