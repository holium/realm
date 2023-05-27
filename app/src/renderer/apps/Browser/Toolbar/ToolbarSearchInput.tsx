import {
  ChangeEventHandler,
  KeyboardEvent,
  RefObject,
  useEffect,
  useState,
} from 'react';
import { observer } from 'mobx-react';

import { Box, Flex } from '@holium/design-system/general';
import { TextInput } from '@holium/design-system/inputs';

import { useAppState } from 'renderer/stores/app.store';
import { SpacesIPC } from 'renderer/stores/ipc';
import { useShipStore } from 'renderer/stores/ship.store';
import {
  getFaviconFromUrl,
  getSiteNameFromUrl,
} from 'renderer/system/desktop/components/SystemBar/components/CommunityBar/AppDock/util';

import { createUrl } from '../helpers/createUrl';
import { useBrowser } from '../store';
import { ToolbarLockIcon } from './ToolbarLockIcon';
import { ToolbarStarIcon } from './ToolbarStarIcon';

type Props = {
  innerRef: RefObject<HTMLDivElement>;
  readyWebview: Electron.WebviewTag | undefined;
};

const ToolbarSearchInputPresenter = ({ innerRef, readyWebview }: Props) => {
  const { theme } = useAppState();
  const { spacesStore } = useShipStore();
  const currentSpace = spacesStore.selected;

  const { currentTab, setInPageNav, setUrl } = useBrowser();
  const [input, setInput] = useState(currentTab.inPageNav ?? '');

  const starred = Boolean(currentSpace?.hasBookmark(currentTab.inPageNav));

  const handleStarClick = () => {
    const spacePath = currentSpace?.path;
    if (!spacePath) return;

    const title = getSiteNameFromUrl(input);

    if (starred) {
      SpacesIPC.removeBookmark(spacePath, input, title);
    } else {
      SpacesIPC.addBookmark({
        path: spacePath,
        url: input,
        title: title,
        favicon: getFaviconFromUrl(input),
        color: '#FFFFFF',
      });
    }
  };

  useEffect(() => {
    if (!readyWebview) return;

    const handleNavigation = (e: Electron.DidNavigateEvent) => {
      setInput(e.url);
      setInPageNav(e.url);
    };

    readyWebview.addEventListener('did-navigate', handleNavigation);
    readyWebview.addEventListener('did-navigate-in-page', handleNavigation);

    return () => {
      readyWebview.removeEventListener('did-navigate', handleNavigation);
      readyWebview.removeEventListener(
        'did-navigate-in-page',
        handleNavigation
      );
    };
  }, [readyWebview]);

  const onInputChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    setInput(e.target.value);
  };

  const search = () => {
    if (input) {
      const normalizedUrl = createUrl(input);
      setInput(normalizedUrl);
      setUrl(normalizedUrl);
    }
  };

  const onKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur();
      search();
    }
  };

  return (
    <Flex flex={1} ref={innerRef}>
      <TextInput
        autoFocus
        id="browser-search-input"
        name="browser-search-input"
        tabIndex={0}
        leftAdornment={
          <Box ml={2}>
            <ToolbarLockIcon
              isSafe={currentTab.isSafe}
              loading={currentTab.loader.state === 'loading'}
            />
          </Box>
        }
        rightAdornment={
          <ToolbarStarIcon starred={starred} onClick={handleStarClick} />
        }
        placeholder="Search DuckDuckGo or enter url"
        width="100%"
        style={{
          borderRadius: '20px',
          height: 32,
          backgroundColor: theme.inputColor,
        }}
        value={input}
        onChange={onInputChange}
        onKeyDown={onKeyPress}
      />
    </Flex>
  );
};

export const ToolbarSearchInput = observer(ToolbarSearchInputPresenter);
