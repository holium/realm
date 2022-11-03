import { FC } from 'react';
import { observer } from 'mobx-react';
import { Flex, Text, Button } from 'renderer/components';
import { useTrayApps } from 'renderer/apps/store';
import { WalletCard } from '../common/WalletCard';
import { NetworkType, WalletView } from 'os/services/tray/wallet.model';
import { WalletActions } from 'renderer/logic/actions/wallet';

interface EthereumWalletListProps {
  network: NetworkType;
}

export const EthereumWalletList: FC<EthereumWalletListProps> = observer(
  (props: EthereumWalletListProps) => {
    const { walletApp } = useTrayApps();
    const list = walletApp.ethereum.list;
    console.log("SHOULDN'T BE HERE");

    const List: FC = () => {
      return (
        <Flex width="100%" flexDirection="column" overflowY="scroll">
          {list.map((walletEntry) => {
            let fullWallet = walletApp.ethereum.wallets.get(walletEntry.key);
            /*props.network === 'ethereum'
                ? walletApp.ethereum.wallets.get(walletEntry.key)
                : walletApp.bitcoin.wallets.get(walletEntry.key);
              */
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
      let onClick = () => {
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
              {props.network === 'ethereum' ? 'Ethereum' : 'Bitcoin'} wallets
              yet.
            </Text>
          </Flex>
          <Flex mt={9} justifyContent="center">
            <Button onClick={onClick}>Create wallet</Button>
          </Flex>
        </Flex>
      );
    };

    return (
      <Flex
        p={4}
        height="100%"
        width="100%"
        flexDirection="column"
        alignItems="center"
      >
        {list.length ? <List /> : <Empty network={props.network} />}
      </Flex>
    );
  }
);
