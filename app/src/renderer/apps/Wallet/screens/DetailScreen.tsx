import { useMemo, useState } from 'react';
import { observer } from 'mobx-react';

import { Box, Flex, Text } from '@holium/design-system/general';

import { NetworkType } from 'os/services/ship/wallet/wallet.types';
import { WalletScreen } from 'renderer/apps/Wallet/types';
import {
  BitcoinWalletType,
  ERC20Type,
  EthWalletType,
} from 'renderer/stores/models/wallet.model';
import { useShipStore } from 'renderer/stores/ship.store';

import { CoinList } from '../components/Detail/CoinList';
import { DetailHero } from '../components/Detail/DetailHero';
import { DisplayType, ListSelector } from '../components/Detail/ListSelector';
import { NFTList } from '../components/Detail/NFTList';
import { TransactionList } from '../components/Transaction/TransactionList';
import { getCoins, getNfts, getTransactions } from '../helpers';

const DetailScreenPresenter = () => {
  const { walletStore } = useShipStore();
  const [QROpen, setQROpen] = useState(false);
  const sendTrans =
    walletStore.navState.view === WalletScreen.TRANSACTION_SEND ||
    walletStore.navState.view === WalletScreen.TRANSACTION_CONFIRM;
  const hideWalletHero =
    walletStore.navState.view === WalletScreen.TRANSACTION_CONFIRM;
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
    walletStore.navState.network === NetworkType.ETHEREUM
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
            walletStore.navigate(WalletScreen.TRANSACTION_SEND, {
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
                <TransactionList height={250} transactions={transactions} />
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

export const DetailScreen = observer(DetailScreenPresenter);
