import { BarStyle, Flex } from '@holium/design-system';

import { AppDock } from './AppDock/AppDock';
import { SpaceSelector } from './SpaceSelector';

export const CommunityBar = () => {
  return (
    <BarStyle pl="2px" pr={1} width="calc(100% - 446px)">
      <SpaceSelector />
      <Flex flex={1}>
        <AppDock />
      </Flex>
      <Flex>{/* <RoomTray /> */}</Flex>
    </BarStyle>
  );
};
