import { FC, useEffect, useState } from 'react';
import { observer } from 'mobx-react';
import { rgba, lighten, darken } from 'polished';

import {
  Grid,
  Flex,
  Icons,
  Box,
  Sigil,
  Text,
  IconButton,
} from '../../../components';
import { useMst, useShip, useAuth } from '../../../logic/store';
import { displayDate } from '../../../logic/utils/time';
import { ThemeStoreType } from '../../../logic/theme/store';

type ProfileProps = {
  theme: ThemeStoreType;
  dimensions: {
    height: number;
    width: number;
  };
};

export const Profile: FC<ProfileProps> = (props: ProfileProps) => {
  const { ship } = useShip();
  const { authStore } = useAuth();
  let [batteryLevel, setBatteryLevel] = useState(0);
  const { dimensions } = props;
  const { backgroundColor, textColor, windowColor, iconColor } = props.theme;

  // const iconColor = darken(0.5, textColor);
  // const dividerBg = useMemo(() => rgba(lighten(0.2, dockColor), 0.4), [theme]);

  const bgHover = darken(0.05, backgroundColor);

  useEffect(() => {
    // @ts-ignore
    navigator.getBattery().then((battery: any) => {
      const level = battery.level;
      console.log(battery);
      setBatteryLevel(level);
    });
  }, []);

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
        pt={4}
        alignItems="center"
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
            customBg={backgroundColor}
            size={26}
            color={iconColor}
            onClick={() => {
              authStore.logout(currentShip.patp);
            }}
          >
            <Icons name="Lock" />
          </IconButton>
          <IconButton customBg={backgroundColor} size={26} color={iconColor}>
            <Icons name="Settings" />
          </IconButton>
        </Flex>
      </Flex>
      <Flex flex={1} mb="36px" justifyContent="center" alignItems="center">
        <Text opacity={0.3}>No notifications</Text>
      </Flex>
      {/* Footer */}
      <Flex
        position="absolute"
        left={14}
        right={14}
        bottom={14}
        justifyContent="space-between"
      >
        <Text opacity={0.5} fontSize={2}>
          {displayDate(new Date().valueOf(), {
            dayOnly: true,
            long: true,
          })}
        </Text>
        <Flex></Flex>
        {/* <Text opacity={2} fontSize={2}>
          {displayDate(new Date().valueOf(), {
            dayOnly: true,
            long: true,
          })}
        </Text> */}
      </Flex>

      {/* <Flex
        position="absolute"
        flexDirection="column"
        gap={2}
        pt={2}
        pr={2}
        pl={2}
        pb={2}
        style={{ bottom: 0, top: 50, left: 0, right: 0 }}
        overflowY="hidden"
      >
        <MenuItem
          label="Preferences"
          icon={<Icons size={1} name="UserSettings" />}
          customBg={bgHover}
          onClick={() => {
            console.log('open preferences');
          }}
        />
        <MenuItem
          label="Logout"
          icon={<Icons size={1} name="Logout" />}
          customBg={bgHover}
          onClick={() => {
            authStore.logout();
          }}
        />
      </Flex> */}
    </Grid.Column>
  );
};
