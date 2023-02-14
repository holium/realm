import { Flex } from 'renderer/components';
import { WalletTray } from './WalletTray';
import { MessagesTray } from './MessagesTray';
import { AccountTray } from './AccountTray';
import { BarStyle } from '@holium/design-system';
import { RoomTray } from './Rooms';

export const ShipBar = () => (
  <BarStyle pl="3px" pr="6px" justifyContent="space-between">
    <Flex gap={8} justifyContent="space-between" alignItems="center">
      <RoomTray />
      <WalletTray />
      <MessagesTray />
      <AccountTray />
      {/* <TrayClock /> */}
    </Flex>
  </BarStyle>
);
