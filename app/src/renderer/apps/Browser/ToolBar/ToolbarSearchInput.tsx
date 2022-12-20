import { useState, ChangeEventHandler, KeyboardEvent, RefObject } from 'react';
import { observer } from 'mobx-react';
import { Flex, Input } from 'renderer/components';
import { useServices } from 'renderer/logic/store';
import { createUrl } from '../helpers/createUrl';
import { useBrowser } from '../store';
import { ToolbarLockIcon } from './ToolbarLockIcon';
import { ToolbarSearchIcon } from './ToolbarSearchIcon';

const isUrlSafe = (url: string) => {
  return url.startsWith('https://');
};

type Props = {
  innerRef: RefObject<HTMLDivElement>;
};

export const ToolbarSearchInput = observer(({ innerRef }: Props) => {
  const { currentTab, setCurrentTab } = useBrowser();
  const { theme } = useServices();
  const [url, setUrl] = useState(currentTab.url || '');
  const [isSafe, setIsSafe] = useState(isUrlSafe(url));

  const onInputChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    setUrl(e.target.value);
  };

  const search = () => {
    if (url) {
      const normalizedUrl = createUrl(url);
      setUrl(normalizedUrl);
      setCurrentTab(normalizedUrl);
      setIsSafe(isUrlSafe(normalizedUrl));
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
        leftIcon={<ToolbarLockIcon loading={false} isSafe={isSafe} />}
        rightIcon={<ToolbarSearchIcon onClick={search} />}
        placeholder="Search Qwant or enter url"
        wrapperStyle={{
          borderRadius: '20px',
          height: 32,
          backgroundColor: theme.currentTheme.inputColor,
        }}
        value={url}
        onChange={onInputChange}
        onKeyPress={onKeyPress}
      />
    </Flex>
  );
});
