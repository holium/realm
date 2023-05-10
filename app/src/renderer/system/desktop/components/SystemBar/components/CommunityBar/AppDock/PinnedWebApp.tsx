import { Reorder } from 'framer-motion';
import { observer } from 'mobx-react';

import { Flex } from '@holium/design-system/general';

import { useBrowser } from 'renderer/apps/Browser/store';
import { useAppState } from 'renderer/stores/app.store';

type Props = {
  url: string;
};

const PinnedWebAppPresenter = ({ url }: Props) => {
  const { setUrl } = useBrowser();
  const { shellStore } = useAppState();

  // First uppercase letter of the website name.
  // Remove any protocol and www. from the url.
  const character = url
    .replace(/(^\w+:|^)\/\//, '')
    .replace('www.', '')
    .substring(0, 1)
    .toUpperCase();

  const onClick = () => {
    const appId = 'os-browser';
    const appWindow = shellStore.getWindowByAppId(appId);

    if (appWindow) {
      if (appWindow.isMinimized) {
        shellStore.toggleMinimized(appId);
      } else {
        shellStore.setActive(appId);
      }
    } else {
      shellStore.openRelicWindow();
    }
    shellStore.closeHomePane();

    setUrl(url);
  };

  return (
    <Reorder.Item key={url} value={url}>
      <Flex
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
        {character}
      </Flex>
    </Reorder.Item>
  );
};

export const PinnedWebApp = observer(PinnedWebAppPresenter);
