import { useMemo, useState } from 'react';
import { observer } from 'mobx-react';

import { Box, Button, Flex, Text } from '@holium/design-system';

import {
  BitcoinWalletType,
  ChainType,
  ERC20Type,
  EthWalletType,
  WalletView,
} from 'renderer/stores/models/wallet.model';
import { useShipStore } from 'renderer/stores/ship.store';

import { getCoins, getNfts, getTransactions } from '../../../lib/helpers';
import { TransactionList } from '../Transaction/List';
import { CoinList } from './CoinList';
import { DetailHero } from './Hero';
import { NFTList } from './NFTList';

type DisplayType = 'coins' | 'nfts' | 'transactions';

type Props = {
  hidePending?: boolean;
};

const DetailPresenter = ({ hidePending = false }: Props) => {
  const { walletStore } = useShipStore();
  const [QROpen, setQROpen] = useState(false);
  const sendTrans =
    walletStore.navState.view === WalletView.TRANSACTION_SEND ||
    walletStore.navState.view === WalletView.TRANSACTION_CONFIRM;
  const hideWalletHero =
    walletStore.navState.view === WalletView.TRANSACTION_CONFIRM;
  const [listView, setListView] = useState<DisplayType>('transactions'); // TODO default to coins or nfts if they have those

  const onScreenChange = () => {};
  const close = async () => {
    await walletStore.navigateBack();
  };

  const wallet = walletStore.currentWallet;
  let coins = null;
  let nfts = null;
  const hasCoin =
    walletStore.navState.detail && walletStore.navState.detail.type === 'coin';
  let coin: ERC20Type | null = null;
  if (walletStore.navState.network === 'ethereum') {
    const ethWalletData = (wallet as EthWalletType).data.get(
      walletStore.navState.protocol
    );
    if (ethWalletData) {
      if (hasCoin && walletStore.navState.detail?.key) {
        const newCoin = ethWalletData.coins.get(
          walletStore.navState.detail?.key
        );
        if (newCoin) coin = newCoin;
      }
      coins = getCoins(ethWalletData.coins as any);
      nfts = getNfts(ethWalletData.nfts as any);
    }
  }

  const walletTransactions =
    walletStore.navState.network === ChainType.ETHEREUM
      ? coin
        ? (wallet as EthWalletType).data
            ?.get(walletStore.navState.protocol ?? '')
            ?.coins.get(coin.address)?.transactionList.transactions
        : (wallet as EthWalletType).data.get(walletStore.navState.protocol)
            ?.transactionList.transactions
      : (wallet as BitcoinWalletType).transactionList.transactions;

  let transactions = useMemo(
    () => getTransactions(walletTransactions || new Map()),
    [walletTransactions]
  );
  const pendingTransactions = transactions
    .filter((trans) => trans.status === 'pending')
    .sort(
      (a, b) =>
        new Date(b.completedAt ?? 0).getTime() -
        new Date(a.completedAt ?? 0).getTime()
    );
  const transactionHistory = transactions
    .filter((trans) => trans.status !== 'pending')
    .sort(
      (a, b) =>
        new Date(b.completedAt ?? 0).getTime() -
        new Date(a.completedAt ?? 0).getTime()
    );
  transactions = [...pendingTransactions, ...transactionHistory];

  if (!wallet) return null;

  return (
    <Flex
      width="100%"
      height="100%"
      justifyContent="flex-start"
      flexDirection="column"
      gap={10}
    >
      <DetailHero
        wallet={wallet}
        coin={coin}
        QROpen={QROpen}
        setQROpen={setQROpen}
        sendTrans={sendTrans}
        hideWalletHero={hideWalletHero}
        onScreenChange={onScreenChange}
        setSendTrans={(send: boolean) => {
          if (send) {
            walletStore.navigate(WalletView.TRANSACTION_SEND, {
              walletIndex: `${wallet.index}`,
              protocol: walletStore.navState.protocol,
              ...(coin && {
                detail: {
                  type: 'coin',
                  txtype: 'coin',
                  coinKey: coin.address,
                  key: coin.address,
                },
              }),
            });
          } else {
            walletStore.navigateBack();
          }
        }}
        close={close}
        coinView={
          coin &&
          !sendTrans && (
            <Flex
              layout="position"
              transition={{
                layout: { duration: 0.1 },
                opacity: { ease: 'linear' },
              }}
              flexDirection="column"
            >
              <Text.Custom opacity={0.5} fontWeight={500} fontSize={2}>
                Transactions
              </Text.Custom>
              <TransactionList
                height={200}
                transactions={transactions}
                hidePending={hidePending}
                ethType={coin?.address}
              />
            </Flex>
          )
        }
      />
      <Box width="100%" hidden={QROpen || sendTrans}>
        <Flex
          width="100%"
          flexDirection="column"
          justifyContent="center"
          gap={10}
        >
          {!coin && (
            <>
              <ListSelector
                network={walletStore.navState.network}
                selected={listView}
                onChange={(newView: DisplayType) => setListView(newView)}
              />
              {listView === 'transactions' && (
                <TransactionList
                  height={250}
                  transactions={transactions}
                  hidePending={hidePending}
                />
              )}
              {listView === 'coins' && coins && (
                <CoinList coins={coins as any} />
              )}
              {listView === 'nfts' && nfts && <NFTList nfts={nfts as any} />}
            </>
          )}
        </Flex>
      </Box>
    </Flex>
  );
};

export const Detail = observer(DetailPresenter);

type ListSelectorProps = {
  selected: DisplayType;
  onChange: any;
  network: string;
};

const ListSelector = ({ selected, onChange, network }: ListSelectorProps) => {
  const MenuButton = ({ selected, onClick, children }: any) => {
    return selected ? (
      <Button.TextButton onClick={onClick} flex={1}>
        {children}
      </Button.TextButton>
    ) : (
      <Button.TextButton onClick={onClick} flex={1} color="icon">
        {children}
      </Button.TextButton>
    );
  };

  return (
    <Flex alignItems="center">
      {network === 'ethereum' && (
        <MenuButton
          selected={selected === 'coins'}
          onClick={() => onChange('coins')}
        >
          Coins
        </MenuButton>
      )}
      {network === 'ethereum' && (
        <MenuButton
          selected={selected === 'nfts'}
          onClick={() => onChange('nfts')}
        >
          NFTs
        </MenuButton>
      )}
      <MenuButton
        selected={selected === 'transactions'}
        onClick={() => onChange('transactions')}
      >
        Transactions
      </MenuButton>
    </Flex>
  );
};
