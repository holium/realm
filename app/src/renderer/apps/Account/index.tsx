import { useEffect } from 'react';
import {
  Grid,
  Flex,
  Icons,
  Sigil,
  Text,
  IconButton,
  TextButton,
} from 'renderer/components';
import { useServices } from 'renderer/logic/store';
// import { displayDate } from 'renderer/logic/lib/time';
import { nativeApps } from '..';
import { NotificationList } from './components/NotificationList';
import { observer } from 'mobx-react';
import { DesktopActions } from 'renderer/logic/actions/desktop';
import { useTrayApps } from '../store';
// import { ShipActions } from 'renderer/logic/actions/ship';
import { lighten, rgba } from 'polished';
import { AuthActions } from 'renderer/logic/actions/auth';

export const AccountTrayApp = observer(() => {
  const { ship, theme, beacon } = useServices();
  const { dimensions, setActiveApp } = useTrayApps();
  const { backgroundColor, textColor, windowColor, iconColor } =
    theme.currentTheme;
  const currentShip = ship!;

  useEffect(() => {
    // navigator.getBattery().then((battery: any) => {
    //   const level = battery.level;
    //   // console.log(battery);
    //   setBatteryLevel(level);
    // });
    return () => {
      // ShipActions.openedNotifications()
      //   .then(() => {})
      //   .catch((err) => {
      //     console.error(err);
      //   });
    };
  }, []);

  const openSettingsApp = () => {
    DesktopActions.openAppWindow('', nativeApps['os-settings']);
  };

  let subtitle;
  if (currentShip.nickname) {
    subtitle = (
      <Text opacity={0.7} fontSize={2} fontWeight={400}>
        {currentShip.patp}
      </Text>
    );
  }

  return (
    <Grid.Column
      style={{ position: 'relative', height: dimensions.height }}
      expand
      noGutter
      overflowY="hidden"
    >
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
          background: rgba(windowColor, 0.6),
          backdropFilter: 'blur(24px)',
          minHeight: 58,
          zIndex: 4,
        }}
      >
        <Flex gap={10} alignItems="center">
          <Text fontWeight={500} fontSize={3}>
            Notifications
          </Text>
          <Text opacity={0.5} fontSize={2}>
            {beacon.unseen.length}
          </Text>
        </Flex>
        <Flex gap={10} alignItems="center">
          <TextButton
            style={{ fontWeight: 400 }}
            textColor={rgba(textColor, 0.5)}
            highlightColor={lighten(0.4, textColor)}
            disabled={true}
            // disabled={notifications.seen.length === 0}
            onClick={(evt: any) => {
              evt.stopPropagation();
              // submitNewChat(evt);
            }}
          >
            Show archived
          </TextButton>
        </Flex>
      </Flex>
      <NotificationList
        unseen={beacon.unseen as any}
        seen={beacon.seen as any}
      />

      <Flex
        position="absolute"
        bottom={0}
        left={0}
        right={0}
        justifyContent="space-between"
        pt={3}
        pb={4}
        px={4}
        style={{
          background: rgba(windowColor, 0.6),
          backdropFilter: 'blur(24px)',
          minHeight: 58,
          zIndex: 4,
        }}
      >
        <Flex alignItems="center">
          <Sigil
            simple
            borderRadiusOverride="4px"
            size={32}
            avatar={currentShip.avatar}
            patp={currentShip.patp}
            color={[currentShip.color || '#000000', 'white']}
          />
          <Flex ml={2} flexDirection="column">
            <Text
              style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
              }}
              fontSize={3}
              fontWeight={500}
              variant="body"
            >
              {currentShip.nickname || currentShip.patp}
            </Text>
            {subtitle}
          </Flex>
        </Flex>
        <Flex gap={16} alignItems="center">
          <IconButton
            className="realm-cursor-hover"
            customBg={backgroundColor}
            size={26}
            color={iconColor}
            style={{ cursor: 'none' }}
            onClick={async () => {
              AuthActions.logout(currentShip.patp);
              setActiveApp(null);
            }}
          >
            <Icons name="Lock" />
          </IconButton>
          <IconButton
            className="realm-cursor-hover"
            data-close-tray="true"
            style={{ cursor: 'none' }}
            customBg={backgroundColor}
            size={26}
            color={iconColor}
            onClick={() => openSettingsApp()}
          >
            <Icons name="Settings" />
          </IconButton>
        </Flex>
      </Flex>
    </Grid.Column>
  );
});
