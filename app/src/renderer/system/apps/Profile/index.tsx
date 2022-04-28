import { FC, useEffect, useState } from 'react';
import { observer } from 'mobx-react';
import { rgba, lighten, darken } from 'polished';

import { WindowThemeType } from '../../../logic/stores/config';
import {
  Grid,
  Flex,
  Box,
  Input,
  IconButton,
  Icons,
  MenuItem,
  Sigil,
  Text,
  Menu,
} from '../../../components';
import { useMst } from '../../../logic/store';

type ProfileProps = {
  theme: WindowThemeType;
  dimensions: {
    height: number;
    width: number;
  };
};

export const Profile: FC<ProfileProps> = (props: ProfileProps) => {
  const { shipStore } = useMst();
  const { dimensions } = props;
  const { backgroundColor, textColor } = props.theme;

  const iconColor = darken(0.5, textColor);
  const bgHover = lighten(0.1, backgroundColor);
  return (
    <Grid.Column
      style={{ position: 'relative', height: dimensions.height }}
      expand
      noGutter
      overflowY="hidden"
    >
      <Grid.Row
        style={{
          position: 'absolute',
          zIndex: 5,
          top: 0,
          left: 0,
          right: 0,
          height: 50,
          background: rgba(lighten(0.2, backgroundColor), 0.9),
          // backdropFilter: 'blur(8px)',
          borderBottom: `1px solid ${rgba(backgroundColor, 0.7)}`,
        }}
        expand
        noGutter
        justify="space-between"
        align="center"
      >
        <Flex pl={4} pr={4} justifyContent="center" alignItems="center">
          {/* <Icons opacity={0.8} name="Wallet" size={24} mr={2} /> */}
          <Text opacity={0.7} fontWeight={600}>
            {shipStore.session.patp}
          </Text>
        </Flex>
      </Grid.Row>

      <Flex
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
            shipStore.logout();
          }}
        />
      </Flex>
    </Grid.Column>
  );
};
