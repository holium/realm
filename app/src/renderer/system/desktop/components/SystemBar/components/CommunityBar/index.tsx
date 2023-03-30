import { Flex } from 'renderer/components';
import { SpaceSelector } from './SpaceSelector';
import { AppDock } from './AppDock/AppDock';
import { BarStyle } from '@holium/design-system';
// import { RoomTray } from '../ShipBar/Rooms';

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
