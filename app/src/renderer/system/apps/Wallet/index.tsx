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
  Sigil,
  Text,
} from '../../../components';
import { useMst } from '../../../logic/store';
import { WalletMain } from './components/WalletMain';

type WalletProps = {
  theme: WindowThemeType;
  dimensions: {
    height: number;
    width: number;
  };
};

export const Wallet: FC<WalletProps> = (props: WalletProps) => {
  const { dimensions } = props;
  const { backgroundColor, textColor } = props.theme;

  const [selectedChat, setSelectedChat] = useState<any>(null);
  const iconColor = darken(0.5, textColor);
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
        <Flex pl={3} pr={4} justifyContent="center" alignItems="center">
          <Icons opacity={0.8} name="Wallet" size={24} mr={2} />
          <Text
            opacity={0.7}
            style={{ textTransform: 'uppercase' }}
            fontWeight={600}
          >
            Wallet
          </Text>
        </Flex>

        <Flex pl={2} pr={2}>
          {/* <Select /> */}
          {/* <IconButton size={28}>
            <Icons name="OneThirdLayout" />
          </IconButton> */}
        </Flex>
      </Grid.Row>

      <Flex
        position="absolute"
        style={{ bottom: 40, top: 50, left: 0, right: 0 }}
        overflowY="hidden"
      >
        <WalletMain theme={props.theme} />
      </Flex>
      <Grid.Row
        expand
        noGutter
        justify="space-between"
        align="center"
        style={{
          background: rgba(lighten(0.2, backgroundColor), 0.9),
          // backdropFilter: 'blur(8px)',
          borderTop: `1px solid ${rgba(backgroundColor, 0.7)}`,
          position: 'absolute',
          padding: '0 8px',
          bottom: 0,
          left: 0,
          right: 0,
          height: 50,
        }}
      >
        <Text
          display="flex"
          flexDirection="row"
          alignItems="center"
          ml={2}
          opacity={0.7}
        >
          1JCKfg...u8vJCh
          <IconButton size={24} ml={1} color={iconColor}>
            <Icons name="Copy" />
          </IconButton>
        </Text>
        <Flex>
          <IconButton size={28} mr={2} color={iconColor}>
            <Icons name="QRCode" />
          </IconButton>
          <IconButton size={28} color={iconColor}>
            <Icons name="ShareBox" />
          </IconButton>
        </Flex>
      </Grid.Row>
    </Grid.Column>
  );
};
