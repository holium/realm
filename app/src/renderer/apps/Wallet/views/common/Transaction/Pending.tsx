import { FC } from 'react';
import { Button, Flex, Icon, Spinner, Text } from '@holium/design-system';
import {
  ProtocolType,
  TransactionType,
  WalletView,
} from 'renderer/stores/models/wallet.model';
import { useShipStore } from 'renderer/stores/ship.store';

import {
  formatBtcAmount,
  formatEthAmount,
  shortened,
} from '../../../lib/helpers';

import { TxType } from './List';

interface PendingTransactionDisplayProps {
  transactions: TransactionType[];
  hide: any;
}
export const PendingTransactionDisplay: FC<PendingTransactionDisplayProps> = (
  props: PendingTransactionDisplayProps
) => {
  const pendingTransactions = props.transactions
    .filter((trans) => trans.status === 'pending')
    .sort(
      (a, b) =>
        new Date(a.initiatedAt ?? 0).getTime() -
        new Date(b.initiatedAt ?? 0).getTime()
    );

  return pendingTransactions.length ? (
    <Flex width="100%">
      <PendingTransaction
        transaction={pendingTransactions[0]}
        hide={props.hide}
      />
    </Flex>
  ) : null;
};

interface PendingTransactionProps {
  transaction: TransactionType;
  hide: any;
}

export const PendingTransaction: FC<PendingTransactionProps> = (
  props: PendingTransactionProps
) => {
  const { walletStore } = useShipStore();

  const goToTransaction = () => {
    walletStore.navigate(WalletView.TRANSACTION_DETAIL, {
      walletIndex: props.transaction.walletIndex.toString(),
      detail: {
        type: 'transaction',
        txtype: walletStore.navState.detail?.txtype as TxType,
        coinKey: walletStore.navState.detail?.coinKey,
        key: props.transaction.hash,
      },
    });
  };

  const isEth = props.transaction.network === 'ethereum';
  const ethAmount = formatEthAmount(isEth ? props.transaction.amount : '1');
  const btcAmount = formatBtcAmount(!isEth ? props.transaction.amount : '1');
  const themDisplay =
    props.transaction.theirPatp || shortened(props.transaction.theirAddress);
  let unitsDisplay = 'BTC';
  if (isEth) {
    console.log(props.transaction);
    console.log(props.transaction.ethType);
    unitsDisplay =
      props.transaction.ethType === 'ETH'
        ? walletStore.navState.protocol === ProtocolType.UQBAR
          ? 'zigs'
          : 'ETH'
        : walletStore.ethereum.wallets
            ?.get(props.transaction.walletIndex.toString())
            ?.data.get(walletStore.navState.protocol)
            ?.coins.get(props.transaction.ethType)?.name ?? '';
  }

  return (
    <Flex width="100%" justifyContent="space-between" borderRadius="9px">
      <Flex
        justifyContent="center"
        alignItems="center"
        onClick={goToTransaction}
      >
        <Flex height="100%" alignItems="center">
          <Spinner size={0} />
        </Flex>
        <Flex flexDirection="column">
          <Text.Body variant="body">
            {props.transaction.type === 'sent' ? 'Sending' : 'Receiving'}{' '}
            {isEth ? ethAmount.eth : btcAmount.btc} {unitsDisplay}
          </Text.Body>
          <Text.Body variant="body" fontSize={1}>
            {props.transaction.type === 'sent' ? 'To:' : 'From:'} {themDisplay}{' '}
            <Icon ml="7px" name="ShareBox" size="15px" />
          </Text.Body>
        </Flex>
      </Flex>
      <Flex justifyContent="center" alignItems="center">
        <Button.IconButton onClick={props.hide} mr={1}>
          <Icon opacity={0.7} name="Close" size="15px" />
        </Button.IconButton>
      </Flex>
    </Flex>
  );
};
