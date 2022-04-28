import { FC, useEffect, useState } from 'react';
import { observer } from 'mobx-react';
import { rgba, lighten, darken } from 'polished';

import { WindowThemeType } from '../../../../logic/stores/config';
import {
  Grid,
  Flex,
  Box,
  Input,
  IconButton,
  Icons,
  Sigil,
  Text,
} from '../../../../components';
import { CircleButton } from './CircleButton';

type WalletMainProps = {
  theme: WindowThemeType;
};

export const WalletMain: FC<WalletMainProps> = (props: WalletMainProps) => {
  // const { walletStore } = useMst();
  const { theme } = props;

  return (
    <Grid.Column noGutter expand align="center" justify="center">
      <Text mb={2} fontWeight={400} opacity={0.5} fontSize={3}>
        YOUR BALANCE
      </Text>
      <Text mb={1} fontWeight={600} color="text.primary" fontSize={9}>
        0 BSV
      </Text>
      <Text fontWeight={500} opacity={0.6} color="text.primary" fontSize={5}>
        ≈ 0 USD
      </Text>
      <Flex mt={4} gap={16} flexDirection="row" alignItems="center">
        <CircleButton icon="Receive" title="Receive" />
        <CircleButton icon="Send" title="Send" />
      </Flex>
    </Grid.Column>
  );
};
