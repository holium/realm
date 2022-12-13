import { FC } from 'react';
import { observer } from 'mobx-react';
import { Flex, Text, Button } from 'renderer/components';
import { useTrayApps } from 'renderer/apps/store';
import { WalletCard } from './common/WalletCard';
import {
  NetworkStoreType,
  NetworkType,
  WalletView,
} from 'os/services/tray/wallet-lib';
import { WalletActions } from 'renderer/logic/actions/wallet';

interface WalletListProps {}

export const WalletList: FC<WalletListProps> = observer(
  (props: WalletListProps) => {
    const { walletApp } = useTrayApps();
    const list = walletApp.currentStore.list;

    const List: FC = () => {
      return (
        <Flex
          p={4}
          width="100%"
          flexDirection="column"
          layoutScroll
          gap={6}
          overflowX="visible"
          overflowY="scroll"
        >
          {list.map((walletEntry) => {
            const fullWallet = walletApp.currentStore.wallets.get(
              walletEntry.key
            );
            return (
              <WalletCard
                key={walletEntry.address}
                wallet={fullWallet!}
                onSelect={() => {
                  WalletActions.navigate(WalletView.WALLET_DETAIL, {
                    walletIndex: walletEntry.key,
                  });
                }}
              />
            );
          })}
        </Flex>
      );
    };

    const Empty: FC<any> = (props: any) => {
      const onClick = () => {
        WalletActions.navigate(WalletView.CREATE_WALLET);
      };

      return (
        <Flex
          width="100%"
          height="100%"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
        >
          <Text variant="h3" textAlign="center">
            No wallets
          </Text>
          <Flex width="80%" justifyContent="center">
            <Text mt={4} variant="body" textAlign="center">
              You haven't created any{' '}
              {walletApp.navState.network === 'ethereum'
                ? 'Ethereum'
                : walletApp.navState.btcNetwork === NetworkStoreType.BTC_MAIN
                ? 'Bitcoin'
                : 'Bitcoin Testnet'}{' '}
              wallets yet.
            </Text>
          </Flex>
          <Flex mt={9} justifyContent="center">
            <Button onClick={onClick}>Create wallet</Button>
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
        {walletApp.navState.network === NetworkType.BITCOIN ? (
          <Flex
            width="100%"
            height="100%"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
          >
            <Text variant="h3" textAlign="center">
              Coming soon...
            </Text>{' '}
          </Flex>
        ) : (
          <Empty network={walletApp.navState.network} />
        )}
      </Flex>
    );
  }
);
