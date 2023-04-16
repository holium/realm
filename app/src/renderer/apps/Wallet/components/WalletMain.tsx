import { FC } from 'react';
import { Flex, Text } from '@holium/design-system';
import { CircleButton } from './CircleButton';

export const WalletMain: FC = () => {
  // const { walletStore } = useMst();

  return (
    <Flex
      flexDirection="column"
      noGutter
      expand
      align="center"
      justify="center"
    >
      <Text.Body
        letterSpacing="6%"
        mb={1}
        fontWeight={500}
        opacity={0.5}
        fontSize={2}
      >
        YOUR BALANCE
      </Text.Body>
      <Text.Body mb={1} fontWeight={600} fontSize={9}>
        0 BTC
      </Text.Body>
      <Text.Body fontWeight={400} opacity={0.6} fontSize={5}>
        ≈ 0 USD
      </Text.Body>
      <Flex mt={6} gap={24} flexDirection="row" alignItems="center">
        <CircleButton icon="Receive" title="Receive" />
        <CircleButton icon="Send" title="Send" />
      </Flex>
    </Flex>
  );
};
