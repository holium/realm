import { useEffect } from 'react';
import { Button, Avatar, Flex, Icon, Text } from '@holium/design-system';
import { useServices } from 'renderer/logic/store';
// import { displayDate } from 'renderer/logic/lib/time';
import { nativeApps } from '../nativeApps';
import { NotificationList } from './components/NotificationList';
import { observer } from 'mobx-react';
import { DesktopActions } from 'renderer/logic/actions/desktop';
import { useTrayApps } from '../store';
import { AuthActions } from 'renderer/logic/actions/auth';
import { SpacesActions } from 'renderer/logic/actions/spaces';
import { trackEvent } from 'renderer/logic/lib/track';
import { AppType } from 'os/services/spaces/models/bazaar';

const AccountTrayAppPresenter = () => {
  const { ship, beacon } = useServices();
  const { setActiveApp } = useTrayApps();
  const roomsManager = useRooms(ship?.patp);

  useEffect(() => {
    // navigator.getBattery().then((battery: any) => {
    //   const level = battery.level;
    //   // console.log(battery);
    //   setBatteryLevel(level);
    // });
    return () => {
      SpacesActions.sawInbox({ all: null });
      // ShipActions.openedNotifications()
      //   .then(() => {})
      //   .catch((err) => {
      //     console.error(err);
      //   });
    };
  }, []);

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
        pl={4}
        pr={4}
        pt={3}
        pb={3}
        top={0}
        left={0}
        right={0}
        position="absolute"
        alignItems="center"
        justifyContent="space-between"
        style={{
          minHeight: 58,
          zIndex: 4,
        }}
      >
        <Flex gap={10} alignItems="center">
          <Text.Custom fontWeight={500} fontSize={3}>
            Notifications
          </Text.Custom>
          <Text.Custom opacity={0.5} fontSize={2}>
            {beacon.unseen.length}
          </Text.Custom>
        </Flex>
      </Flex>
      <NotificationList unseen={beacon.unseen} seen={beacon.seen} />
      <Flex
        position="absolute"
        bottom={0}
        left={0}
        right={0}
        justifyContent="space-between"
        pt={4}
        pb={3}
        px={4}
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
        <Flex gap={12} alignItems="center">
          <Button.IconButton
            size={28}
            className="realm-cursor-hover"
            onClick={async () => {
              await roomsManager.cleanup();
              AuthActions.logout(ship.patp);
              setActiveApp(null);
              trackEvent('CLICK_LOG_OUT', 'DESKTOP_SCREEN');
            }}
          >
            <Icon name="Lock" size={22} opacity={0.7} />
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
