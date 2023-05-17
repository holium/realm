import { observer } from 'mobx-react';

import { Button, Flex, Text } from '@holium/design-system/general';

import {
  NetworkStoreType,
  NetworkType,
} from 'os/services/ship/wallet/wallet.types';
import { useShipStore } from 'renderer/stores/ship.store';

import { WalletCard } from '../components/WalletCard';
import { WalletScreen } from '../types';

const WalletListScreenPresenter = () => {
  const { walletStore } = useShipStore();
  const list = walletStore.currentStore.list;

  const List = () => {
    return (
      <Flex
        height="100%"
        width="100%"
        flexDirection="column"
        layoutScroll
        gap={6}
        overflowX="visible"
        overflowY="auto"
      >
        {list.map((walletEntry) => {
          return (
            <WalletCard
              key={walletEntry.address}
              walletKey={walletEntry.key}
              onSelect={() => {
                walletStore.navigate(WalletScreen.WALLET_DETAIL, {
                  walletIndex: walletEntry.key,
                });
              }}
            />
          );
        })}
      </Flex>
    );
  };

  const Empty = () => {
    const onClick = () => {
      walletStore.navigate(WalletScreen.CREATE_WALLET);
    };

    return (
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
        <Flex width="80%" justifyContent="center">
          <Text.Body variant="body" textAlign="center">
            You haven't created any{' '}
            {walletStore.navState.network === 'ethereum'
              ? 'Ethereum'
              : walletStore.navState.btcNetwork === NetworkStoreType.BTC_MAIN
              ? 'Bitcoin'
              : 'Bitcoin Testnet'}{' '}
            addresses yet.
          </Text.Body>
        </Flex>
        <Flex justifyContent="center">
          <Button.TextButton onClick={onClick}>
            Create address
          </Button.TextButton>
        </Flex>
      </Flex>
    );
  };

  return list.length ? (
    <List />
  ) : (
    <Flex height="100%" width="100%" flexDirection="column" alignItems="center">
      {walletStore.navState.network === NetworkType.BITCOIN ? (
        <Flex
          width="100%"
          height="100%"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
        >
          <Text.H3 variant="h3" textAlign="center">
            Coming soon...
          </Text.H3>{' '}
        </Flex>
      ) : (
        // @ts-ignore
        <Empty network={walletStore.navState.network} />
      )}
    </Flex>
  );
};

export const WalletListScreen = observer(WalletListScreenPresenter);
