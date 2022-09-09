import { FC, useEffect, useState } from 'react';
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
import { ThemeModelType } from 'os/services/shell/theme.model';
import { useTrayApps } from '../store';

type ProfileProps = {
  theme: ThemeModelType;
  // dimensions: {
  //   height: number;
  //   width: number;
  // };
};

export const AccountTrayApp: FC<ProfileProps> = observer(
  (props: ProfileProps) => {
    const { ship, identity, notifications } = useServices();
    const { auth } = identity;
    // let [batteryLevel, setBatteryLevel] = useState(0);
    // const { dimensions } = props;
    const { dimensions } = useTrayApps();
    const { backgroundColor, textColor, windowColor, iconColor } = props.theme;

    // useEffect(() => {
    //   // @ts-ignore
    //   // navigator.getBattery().then((battery: any) => {
    //   //   const level = battery.level;
    //   //   // console.log(battery);
    //   //   setBatteryLevel(level);
    //   // });
    //   // window.electron.ship
    //   //   .getInitialNotifications()
    //   //   .then((result: any) => console.log(result));
    // }, []);

    const openSettingsApp = () => {
      DesktopActions.openAppWindow('', nativeApps['os-settings']);
    };

    const currentShip = ship!;

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
          alignItems="center"
          justifyContent="space-between"
        >
          <Flex gap={10} alignItems="center">
            <Text fontWeight={500} fontSize={2}>
              Notifications
            </Text>
            <Text opacity={0.5} fontSize={2}>
              {notifications.unseen.length}
            </Text>
          </Flex>
          <Flex gap={10} alignItems="center">
            <TextButton
              style={{ fontWeight: 400 }}
              textColor="rgb(208, 66, 27, .7)"
              highlightColor="#D0421B"
              disabled={notifications.unseen.length === 0}
              onClick={(evt: any) => {
                evt.stopPropagation();
                // submitNewChat(evt);
              }}
            >
              Dismiss all
            </TextButton>
          </Flex>
        </Flex>
        <Flex flex={1} mb="50px" justifyContent="center" alignItems="center">
          {notifications.unseen.length ? (
            <NotificationList notifications={notifications.unseen} />
          ) : (
            <Text opacity={0.3}>No notifications</Text>
          )}
        </Flex>
        {/* Footer */}
        <Flex
          position="absolute"
          left={14}
          right={14}
          bottom={14}
          justifyContent="space-between"
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
              onClick={() => {
                auth.logout(ship!.patp!);
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
  }
);
