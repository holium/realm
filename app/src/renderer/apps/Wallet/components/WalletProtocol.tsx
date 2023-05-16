import { observer } from 'mobx-react';

import { Box, Flex, Text } from '@holium/design-system/general';

import { ProtocolType } from 'os/services/ship/wallet/wallet.types';

type Props = {
  protocol: ProtocolType;
};

const WalletProtocolPresenter = ({ protocol }: Props) => (
  <Flex
    width="fit-content"
    px={2}
    alignItems="center"
    justifyContent="center"
    borderRadius="33px"
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
        fontSize: '12px',
      }}
    >
      {protocol}
    </Text.Body>
  </Flex>
);

export const WalletProtocol = observer(WalletProtocolPresenter);
