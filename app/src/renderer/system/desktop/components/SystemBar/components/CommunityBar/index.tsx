import { Flex } from 'renderer/components';
import { SpaceSelector } from './SpaceSelector';
import { AppDock } from './AppDock';
import { BarStyle } from '@holium/design-system';

export const CommunityBar = () => {
  return (
    <BarStyle pl="2px" pr={1} flex={1}>
      <SpaceSelector />
      <Flex flex={1}>
        <AppDock />
      </Flex>
      <Flex>{/* <RoomTray /> */}</Flex>
    </BarStyle>
  );
};
