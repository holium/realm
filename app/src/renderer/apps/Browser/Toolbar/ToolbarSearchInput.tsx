import {
  ChangeEventHandler,
  KeyboardEvent,
  RefObject,
  useEffect,
  useState,
} from 'react';
import { observer } from 'mobx-react';
import { Flex, Input } from 'renderer/components';
import { useServices } from 'renderer/logic/store';
import { createUrl } from '../helpers/createUrl';
import { useBrowser } from '../store';
import { ToolbarLockIcon } from './ToolbarLockIcon';
import { ToolbarSearchIcon } from './ToolbarSearchIcon';

type Props = {
  innerRef: RefObject<HTMLDivElement>;
  readyWebview: Electron.WebviewTag | undefined;
};

const ToolbarSearchInputPresenter = ({ innerRef, readyWebview }: Props) => {
  const { theme } = useServices();
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
      <Input
        autoFocus
        tabIndex={0}
        leftIcon={
          <ToolbarLockIcon
            isSafe={currentTab.isSafe}
            loading={currentTab.loader.state === 'loading'}
          />
        }
        rightIcon={<ToolbarSearchIcon onClick={search} />}
        placeholder="Search Qwant or enter url"
        wrapperStyle={{
          borderRadius: '20px',
          height: 32,
          backgroundColor: theme.currentTheme.inputColor,
        }}
        value={input}
        onChange={onInputChange}
        onKeyPress={onKeyPress}
      />
    </Flex>
  );
};

export const ToolbarSearchInput = observer(ToolbarSearchInputPresenter);
