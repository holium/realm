import { observer } from 'mobx-react';
import { Flex } from 'renderer/components';
import { WalletTray } from './WalletTray';
import { MessagesTray } from './MessagesTray';
import { AccountTray } from './AccountTray';
import { useServices } from 'renderer/logic/store';
import { BarStyle } from '@holium/design-system';
import { useRooms } from 'renderer/apps/Rooms/useRooms';
import { RoomTray } from '../CommunityBar/Rooms';

export const ShipBar = observer(() => {
  const { theme } = useServices();
  const roomsManager = useRooms();

  return (
    <BarStyle pl="3px" pr="6px" justifyContent="space-between">
      <Flex gap={8} justifyContent="space-between" alignItems="center">
        <RoomTray />
        {/* <RoomsDock
          live={roomsManager.live.room}
          rooms={roomsManager.rooms}
          onCreate={() => {
            console.log('create room');
          }}
          onOpen={() => {
            console.log('open rooms tray');
          }}
          onMute={(muted: boolean) => {}}
          onCursor={(enabled: boolean) => {}}
          onLeave={() => {}}
        /> */}
        <WalletTray theme={theme.currentTheme as any} />
        <MessagesTray theme={theme.currentTheme} />
        {/* <IconButton
          id="notification-tray-icon"
          size={28}
          customBg={iconHoverColor}
          color={textColor}
          whileTap={{ scale: 0.95 }}
          transition={{ scale: 0.1 }}
          onClick={() => {}}
        >
          <Icons name="Notifications" pointerEvents="none" />
        </IconButton> */}
        <AccountTray theme={theme.currentTheme as any} />
        {/* <TrayClock /> */}
      </Flex>
    </BarStyle>
  );
});

export default { ShipBar };
