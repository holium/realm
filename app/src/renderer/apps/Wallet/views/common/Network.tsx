import { observer } from 'mobx-react';
import { Box, Flex, Text } from '@holium/design-system';
import { ProtocolType } from 'os/services/tray/wallet-lib/wallet.model';

interface WalletNetworkProps {
  network: ProtocolType;
}

export const WalletNetwork = observer((props: WalletNetworkProps) => {
  return (
    <Flex
      width="fit-content"
      height={2}
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
      <Text.Body fontSize="12px">{props.network}</Text.Body>
    </Flex>
  );
});
