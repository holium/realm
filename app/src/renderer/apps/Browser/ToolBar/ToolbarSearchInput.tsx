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
};

export const ToolbarSearchInput = observer(({ innerRef }: Props) => {
  const { currentTab, navigate } = useBrowser();
  const { theme } = useServices();
  const [input, setInput] = useState(currentTab.url || '');

  useEffect(() => {
    const webView = document.getElementById(
      currentTab.id
    ) as Electron.WebviewTag;

    if (!webView) return;

    webView.addEventListener('did-navigate', (e) => {
      setInput(e.url);
    });
  }, [currentTab.url, currentTab.id]);

  const onInputChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    setInput(e.target.value);
  };

  const search = () => {
    if (input) {
      const normalizedUrl = createUrl(input);
      setInput(normalizedUrl);
      navigate(normalizedUrl);
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
          <ToolbarLockIcon loading={false} isSafe={currentTab.isSafe} />
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
});
