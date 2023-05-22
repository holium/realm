import { Button, Flex, Text } from '@holium/design-system/general';

import {
  NetworkStoreType,
  NetworkType,
  ProtocolType,
} from 'os/services/ship/wallet/wallet.types';
import {
  BitcoinWalletType,
  EthWalletType,
} from 'renderer/stores/models/wallet.model';

import { WalletCard } from '../../components/WalletCard';

export type WalletWithKey = (BitcoinWalletType | EthWalletType) & {
  key: string;
};

type Props = {
  wallets: WalletWithKey[];
  network: NetworkType;
  protocol: ProtocolType;
  btcNetwork?: NetworkStoreType;
  onSelectAddress: (key: string) => void;
  onClickCreateAddress: () => void;
};

export const WalletListScreenBody = ({
  wallets,
  network,
  protocol,
  btcNetwork,
  onSelectAddress,
  onClickCreateAddress,
}: Props) => {
  if (!wallets || !wallets.length) {
    if (network === NetworkType.BITCOIN) {
      return (
        <Flex flex={1} flexDirection="column" justifyContent="center">
          <Text.H3 variant="h3" textAlign="center">
            Coming soon...
          </Text.H3>{' '}
        </Flex>
      );
    }

    return (
      <Flex
        height="100%"
        width="100%"
        flexDirection="column"
        alignItems="center"
      >
        <Flex
          width="100%"
          height="100%"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          gap={20}
        >
          <Text.H3 variant="h3" textAlign="center">
            No addresses
          </Text.H3>
          <Flex justifyContent="center">
            <Text.Body
              textAlign="center"
              maxWidth="80%"
              style={{ fontWeight: 300 }}
            >
              You haven't created any{' '}
              {network === 'ethereum'
                ? 'Ethereum'
                : btcNetwork === NetworkStoreType.BTC_MAIN
                ? 'Bitcoin'
                : 'Bitcoin Testnet'}{' '}
              wallets yet.
            </Text.Body>
          </Flex>
          <Flex justifyContent="center">
            <Button.TextButton onClick={onClickCreateAddress}>
              Create address
            </Button.TextButton>
          </Flex>
        </Flex>
      </Flex>
    );
  }

  return (
    <Flex
      height="100%"
      width="100%"
      flexDirection="column"
      layoutScroll
      gap={6}
      overflowY="auto"
    >
      {wallets.map((walletEntry) => (
        <WalletCard
          key={walletEntry.address}
          wallet={walletEntry}
          network={network}
          protocol={protocol}
          onSelect={() => onSelectAddress(walletEntry.key)}
        />
      ))}
    </Flex>
  );
};
