import { SpaceSelector } from './SpaceSelector';
import { AppDock } from './AppDock/AppDock';
import { Flex, BarStyle } from '@holium/design-system';

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
