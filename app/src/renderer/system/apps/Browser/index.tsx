import { FC, useRef } from 'react';
import { observer } from 'mobx-react';
import { rgba, lighten, darken } from 'polished';
import { Grid, Flex, Text } from '../../../components';
import { useBrowser } from './store';
import { useMst, useShip } from '../../../logic/store';
import { TabView } from './TabView';

export type BrowserProps = {
  isResizing: boolean;
};

export const Browser: FC<BrowserProps> = observer((props: BrowserProps) => {
  const { isResizing } = props;
  const browserStore = useBrowser();
  const { themeStore } = useMst();
  // const { ship } = useShip();
  const ref = useRef();
  const { backgroundColor, textColor } = themeStore.theme;

  const iconColor = darken(0.5, textColor);
  const bgHover = lighten(0.1, backgroundColor);
  return (
    // <Grid.Column
    //   style={{ position: 'relative', width: 'inherit', height: 'inherit' }}
    //   expand
    //   noGutter
    // >
    browserStore.currentTab && (
      <TabView isResizing={isResizing} tab={browserStore.currentTab} />
    )
    // </Grid.Column>
  );
});

{
  /* <React.Fragment>
  <Box overflowY="scroll">
    <Flex gap={12} flexDirection="column" p="12px">
      <Card p="12px" width="100%" minHeight="240px" elevation="none">
        <Text opacity={0.7} fontSize={2} fontWeight={500}>
          Desktop
        </Text>
      </Card>
      <Card p="12px" width="100%" minHeight="182px" elevation="none">
        <Text opacity={0.7} fontSize={2} fontWeight={500}>
          Mouse
        </Text>
      </Card>
      <Card p="12px" width="100%" minHeight="300px" elevation="none">
        <Text opacity={0.7} fontSize={2} fontWeight={500}>
          Privacy
        </Text>
      </Card>
    </Flex>
  </Box>
</React.Fragment>; */
}
