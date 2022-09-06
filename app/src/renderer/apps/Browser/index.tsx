import { FC, useEffect } from 'react';
import { observer } from 'mobx-react';
// import { Grid, Flex, Text } from '../../components';
import { useBrowser } from './store';
import { TabView } from './TabView';

export type BrowserProps = {
  isResizing: boolean;
};

export const Browser: FC<BrowserProps> = observer((props: BrowserProps) => {
  const { isResizing } = props;
  const { currentTab } = useBrowser();

  return currentTab && <TabView isResizing={isResizing} />;
});
