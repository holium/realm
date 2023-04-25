import { FC } from 'react';
import { Button, Flex, Text } from '@holium/design-system';
import { observer } from 'mobx-react';
import {
  NetworkStoreType,
  NetworkType,
  WalletView,
} from 'renderer/stores/models/wallet.model';
import { useShipStore } from 'renderer/stores/ship.store';

import { WalletCard } from './common/WalletCard';

export const WalletList = observer(() => {
  const { walletStore } = useShipStore();
  const list = walletStore.currentStore.list;

  const List: FC = () => {
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
                walletStore.navigate(WalletView.WALLET_DETAIL, {
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
      walletStore.navigate(WalletView.CREATE_WALLET);
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
          <Text.Body mt={4} variant="body" textAlign="center">
            You haven't created any{' '}
            {walletStore.navState.network === 'ethereum'
              ? 'Ethereum'
              : walletStore.navState.btcNetwork === NetworkStoreType.BTC_MAIN
              ? 'Bitcoin'
              : 'Bitcoin Testnet'}{' '}
            addresses yet.
          </Text.Body>
        </Flex>
        <Flex mt={9} justifyContent="center">
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
    <Flex
      p={4}
      height="100%"
      width="100%"
      flexDirection="column"
      alignItems="center"
    >
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
});
