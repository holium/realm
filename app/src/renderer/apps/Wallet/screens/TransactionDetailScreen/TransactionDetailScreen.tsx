import { useEffect, useState } from 'react';
import { observer } from 'mobx-react';

import { NetworkType } from 'os/services/ship/wallet/wallet.types';
import {
  BitcoinWalletType,
  EthWalletType,
  TransactionType,
  WalletStoreType,
} from 'renderer/stores/models/wallet.model';
import { useShipStore } from 'renderer/stores/ship.store';

import {
  convertBtcAmountToUsd,
  convertEthAmountToUsd,
  formatBtcAmount,
  formatEthAmount,
  getDisplayDate,
  shortened,
} from '../../helpers';
import { TransactionDetailScreenBody } from './TransactionDetailScreenBody';

const getTransaction = (
  walletStore: WalletStoreType
): TransactionType | null => {
  const isEthereum = walletStore.navState.network === NetworkType.ETHEREUM;
  const isCoin = walletStore.navState.detail?.txtype === 'coin';
  const currentWallet = walletStore.currentWallet;

  if (!walletStore.navState.detail?.key) return null;

  if (isEthereum) {
    const walletData = (currentWallet as EthWalletType).data;
    if (isCoin) {
      if (!walletData) return null;

      const transactions = walletData
        .get(walletStore.navState.protocol)
        ?.coins?.get(walletStore.navState.detail?.coinKey ?? '')
        ?.transactionList.transactions;

      if (!transactions) return null;

      return transactions.get(
        walletStore.navState.detail.key
      ) as TransactionType;
    } else {
      const transactions = walletData.get(walletStore.navState.protocol)
        ?.transactionList.transactions;

      if (!transactions) return null;

      return transactions.get(
        walletStore.navState.detail.key
      ) as TransactionType;
    }
  }

  const bitcoinWallet = currentWallet as BitcoinWalletType;
  const transactions = bitcoinWallet.transactionList.transactions;

  if (!transactions) return null;

  return transactions.get(walletStore.navState.detail.key) as TransactionType;
};

const TransactionDetailScreenPresenter = () => {
  const { walletStore } = useShipStore();

  const [ethPrice, setEthPrice] = useState<number>();
  const [bitcoinPrice, setBitcoinPrice] = useState<number>();

  useEffect(() => {
    walletStore.ethereum.conversions.usd.then(setEthPrice);
    walletStore.bitcoin.conversions.usd.then(setBitcoinPrice);
  }, [
    walletStore.ethereum.conversions.usd,
    walletStore.bitcoin.conversions.usd,
  ]);

  let transaction = getTransaction(walletStore);

  if (!transaction) return null;

  const wasSent = transaction.type === 'sent';
  const isEth = transaction.network === 'ethereum';
  const themDisplay =
    transaction.theirPatp || shortened(transaction.theirAddress);
  const completed = new Date(
    transaction.completedAt || transaction.initiatedAt || ''
  );

  const ethAmount = formatEthAmount(isEth ? transaction.amount : '1');
  const btcAmount = formatBtcAmount(!isEth ? transaction.amount : '1');

  return (
    <TransactionDetailScreenBody
      wasSent={wasSent}
      themDisplay={themDisplay}
      completedAtString={getDisplayDate(completed)}
      transactionHash={transaction.hash}
      patp={transaction.theirPatp}
      transactionNotes={transaction.notes}
      transactionStatus={transaction.status}
      protocol={walletStore.navState.protocol}
      saveTransactionNotes={walletStore.saveTransactionNotes}
      amountDisplay={isEth ? `${ethAmount.eth} ETH` : `${btcAmount.btc} BTC`}
      usdAmount={
        isEth
          ? convertEthAmountToUsd(ethAmount, ethPrice)
          : convertBtcAmountToUsd(btcAmount, bitcoinPrice)
      }
    />
  );
};

export const TransactionDetailScreen = observer(
  TransactionDetailScreenPresenter
);
