import { useEffect, useMemo, useState } from 'react';
import { observer } from 'mobx-react';

import { NetworkType } from 'os/services/ship/wallet/wallet.types';
import {
  BitcoinWalletType,
  ERC20Type,
  ERC721Type,
  EthWalletType,
} from 'renderer/stores/models/wallet.model';
import { useShipStore } from 'renderer/stores/ship.store';

import { getCoins, getNfts, getTransactions } from '../../../helpers';
import { DetailScreenBody } from './DetailScreenBody';

const DetailScreenPresenter = () => {
  const { walletStore } = useShipStore();

  let coin: ERC20Type | null = null;
  let coins: ERC20Type[] | null = null;
  let nfts: ERC721Type[] | null = null;

  const [ethPrice, setEthPrice] = useState<number>();
  const [bitcoinPrice, setBitcoinPrice] = useState<number>();

  useEffect(() => {
    walletStore.ethereum.conversions.usd.then(setEthPrice);
    walletStore.bitcoin.conversions.usd.then(setBitcoinPrice);
  }, [
    walletStore.ethereum.conversions.usd,
    walletStore.bitcoin.conversions.usd,
  ]);

  const wallet = walletStore.currentWallet;

  if (walletStore.navState.network === 'ethereum') {
    const ethWalletData = (wallet as EthWalletType).data.get(
      walletStore.navState.protocol
    );

    if (ethWalletData) {
      const hasCoin = walletStore.navState.detail?.type === 'coin';

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
        new Date(b.completedAt ?? b.initiatedAt ?? 0).getTime() -
        new Date(a.completedAt ?? a.initiatedAt ?? 0).getTime()
    );
  const transactionHistory = transactions
    .filter((trans) => trans.status !== 'pending')
    .sort(
      (a, b) =>
        new Date(b.completedAt ?? b.initiatedAt ?? 0).getTime() -
        new Date(a.completedAt ?? a.initiatedAt ?? 0).getTime()
    );
  transactions = [...pendingTransactions, ...transactionHistory];

  if (!wallet) return null;

  return (
    <DetailScreenBody
      wallet={wallet}
      coin={coin}
      transactions={transactions}
      coins={coins}
      nfts={nfts}
      uqTx={walletStore.uqTx}
      screen={walletStore.navState.view}
      to={walletStore.navState.to}
      network={walletStore.navState.network}
      protocol={walletStore.navState.protocol}
      ethPrice={ethPrice}
      bitcoinPrice={bitcoinPrice}
      checkPasscode={walletStore.checkPasscode}
      navigate={walletStore.navigate}
      sendERC20Transaction={walletStore.sendERC20Transaction}
      sendEthereumTransaction={walletStore.sendEthereumTransaction}
      onClickNavigateBack={walletStore.navigateBack}
      getRecipient={walletStore.getRecipient}
      close={walletStore.navigateBack}
    />
  );
};

export const DetailScreen = observer(DetailScreenPresenter);
