import { FC } from 'react';

import { ThemeModelType } from 'os/services/theme.model';
import { Grid, Flex, Text } from '../../../components';
import { CircleButton } from './CircleButton';

interface WalletMainProps {
  theme: ThemeModelType;
}

export const WalletMain: FC<WalletMainProps> = (props: WalletMainProps) => {
  // const { walletStore } = useMst();
  const { theme } = props;

  return (
    <Grid.Column
      style={{
        background: theme.windowColor,
      }}
      noGutter
      expand
      align="center"
      justify="center"
    >
      <Text
        letterSpacing="6%"
        mb={1}
        fontWeight={500}
        opacity={0.5}
        fontSize={2}
      >
        YOUR BALANCE
      </Text>
      <Text mb={1} fontWeight={600} color="text.primary" fontSize={9}>
        0 BTC
      </Text>
      <Text fontWeight={400} opacity={0.6} color="text.primary" fontSize={5}>
        ≈ 0 USD
      </Text>
      <Flex mt={6} gap={24} flexDirection="row" alignItems="center">
        <CircleButton icon="Receive" title="Receive" />
        <CircleButton icon="Send" title="Send" />
      </Flex>
    </Grid.Column>
  );
};
