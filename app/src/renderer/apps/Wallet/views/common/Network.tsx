import { observer } from 'mobx-react';

import { Box, Flex, Text } from '@holium/design-system';

import { NetworkType } from 'renderer/stores/models/wallet.model';

type Props = {
  network: NetworkType;
};

const WalletNetworkPresenter = ({ network }: Props) => (
  <Flex
    width="fit-content"
    px={2}
    alignItems="center"
    justifyContent="center"
    borderRadius="33px"
    bg="border"
  >
    <Box
      height="8px"
      width="8px"
      mr={2}
      borderRadius="50%"
      background="#4CDD86"
    />
    <Text.Custom fontSize="12px">{network}</Text.Custom>
  </Flex>
);

export const WalletNetwork = observer(WalletNetworkPresenter);
