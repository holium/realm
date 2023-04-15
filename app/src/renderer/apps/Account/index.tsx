import { Avatar, Button, Flex, Icon, Text } from '@holium/design-system';
import { observer } from 'mobx-react';
import { AppType } from 'os/services/spaces/models/bazaar';
import { useRooms } from 'renderer/apps/Rooms/useRooms';
import { AuthActions } from 'renderer/logic/actions/auth';
import { DesktopActions } from 'renderer/logic/actions/desktop';
import { trackEvent } from 'renderer/logic/lib/track';
import { useServices } from 'renderer/logic/store';

import { nativeApps } from '../nativeApps';
import { useTrayApps } from '../store';

const AccountTrayAppPresenter = () => {
  const { ship } = useServices();
  const { setActiveApp } = useTrayApps();
  const roomsManager = useRooms(ship?.patp);

  const openSettingsApp = () => {
    DesktopActions.openAppWindow(nativeApps['os-settings'] as AppType);
  };

  if (!ship) return null;

  let subtitle;
  if (ship.nickname) {
    subtitle = (
      <Text.Custom opacity={0.7} fontSize={2} fontWeight={400}>
        {ship.patp}
      </Text.Custom>
    );
  }

  return (
    <>
      <Flex
        position="absolute"
        bottom={0}
        left={0}
        right={0}
        justifyContent="space-between"
        pt={4}
        pb={3}
        pl={3}
        pr={2}
        style={{
          minHeight: 58,
          zIndex: 4,
        }}
      >
        <Flex alignItems="center">
          <Avatar
            simple
            borderRadiusOverride="4px"
            size={32}
            avatar={ship.avatar}
            patp={ship.patp}
            sigilColor={[ship.color || '#000000', 'white']}
          />
          <Flex ml={2} flexDirection="column">
            <Text.Custom
              style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
              }}
              fontSize={3}
              fontWeight={500}
              variant="body"
            >
              {ship.nickname || ship.patp}
            </Text.Custom>
            {subtitle}
          </Flex>
        </Flex>
        <Flex gap={10} alignItems="center">
          <Button.IconButton
            size={28}
            className="realm-cursor-hover"
            onClick={() => {
              roomsManager.cleanup();
              AuthActions.logout(ship.patp);
              setActiveApp(null);
              trackEvent('CLICK_LOG_OUT', 'DESKTOP_SCREEN');
            }}
          >
            <Icon name="Logout" size={22} opacity={0.7} />
          </Button.IconButton>
          <Button.IconButton
            size={28}
            className="realm-cursor-hover"
            onClick={() => {
              roomsManager.cleanup();
              AuthActions.logout(ship.patp);
              setActiveApp(null);
              // trackEvent('CLICK_LOG_OUT', 'DESKTOP_SCREEN');
            }}
          >
            <Icon name="Shutdown" size={22} opacity={0.7} />
          </Button.IconButton>
          <Button.IconButton
            className="realm-cursor-hover"
            data-close-tray="true"
            size={28}
            onClick={() => openSettingsApp()}
          >
            <Icon name="Settings" size={22} opacity={0.7} />
          </Button.IconButton>
        </Flex>
      </Flex>
    </>
  );
};

export const AccountTrayApp = observer(AccountTrayAppPresenter);
