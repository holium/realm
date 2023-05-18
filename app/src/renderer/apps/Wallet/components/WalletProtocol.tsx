import { Box, Flex, Text } from '@holium/design-system/general';

import { ProtocolType } from 'os/services/ship/wallet/wallet.types';

type Props = {
  protocol: ProtocolType;
};

export const WalletProtocol = ({ protocol }: Props) => (
  <Flex
    width="fit-content"
    p="4px 7px"
    alignItems="center"
    justifyContent="center"
    borderRadius="33px"
    background="rgba(var(--rlm-border-rgba), 0.1)"
    //onClick={WalletActions.toggleNetwork}
  >
    <Box
      width="8px"
      height="8px"
      mr={2}
      borderRadius="50%"
      background="#4CDD86"
    />
    <Text.Body
      style={{
        color: 'rgba(var(--rlm-bordertext-rgba), 0.7)',
        fontSize: '12px',
      }}
    >
      {protocol}
    </Text.Body>
  </Flex>
);
