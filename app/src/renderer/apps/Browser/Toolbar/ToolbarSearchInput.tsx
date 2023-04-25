import {
  ChangeEventHandler,
  KeyboardEvent,
  RefObject,
  useEffect,
  useState,
} from 'react';
import { Box, Flex, TextInput } from '@holium/design-system';
import { observer } from 'mobx-react';
import { useAppState } from 'renderer/stores/app.store';

import { createUrl } from '../helpers/createUrl';
import { useBrowser } from '../store';

import { ToolbarLockIcon } from './ToolbarLockIcon';
import { ToolbarSearchIcon } from './ToolbarSearchIcon';

type Props = {
  innerRef: RefObject<HTMLDivElement>;
  readyWebview: Electron.WebviewTag | undefined;
};

const ToolbarSearchInputPresenter = ({ innerRef, readyWebview }: Props) => {
  const { theme } = useAppState();
  const { currentTab, setUrl } = useBrowser();
  const [input, setInput] = useState(currentTab.url ?? '');

  useEffect(() => {
    if (!readyWebview) return;

    readyWebview.addEventListener('did-navigate', (e) => setInput(e.url));
    readyWebview.addEventListener('did-navigate-in-page', (e) =>
      setInput(e.url)
    );

    return () => {
      readyWebview.removeEventListener('did-navigate', (e) => setInput(e.url));
      readyWebview.removeEventListener('did-navigate-in-page', (e) =>
        setInput(e.url)
      );
    };
  }, [readyWebview, readyWebview]);

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
        rightAdornment={<ToolbarSearchIcon onClick={search} />}
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
