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
      height="8px"
      width="8px"
      mr={2}
      borderRadius="50%"
      background="#4CDD86"
    />
    <Text.Custom fontSize="12px">{protocol}</Text.Custom>
  </Flex>
);

export const WalletProtocol = observer(WalletProtocolPresenter);
