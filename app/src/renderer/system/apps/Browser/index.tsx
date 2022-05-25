import { FC, useEffect, useState, useRef } from 'react';
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
import { useMst, useShip } from '../../../logic/store';

type BrowserProps = {
  theme: WindowThemeType;
};

export const Browser: FC<BrowserProps> = (props: BrowserProps) => {
  const { ship } = useShip();
  const ref = useRef();
  const { backgroundColor, textColor } = props.theme;

  // useEffect(() => {
  //   const webview = document.createElement('webview');
  //   webview.setAttribute('url', 'google.com');
  //   ref.current!.appendChild(webview);
  // }, []);

  const iconColor = darken(0.5, textColor);
  const bgHover = lighten(0.1, backgroundColor);
  return (
    <Grid.Column
      style={{ position: 'relative' }}
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
            {ship!.patp}
          </Text>
        </Flex>
      </Grid.Row>
    </Grid.Column>
  );
};
