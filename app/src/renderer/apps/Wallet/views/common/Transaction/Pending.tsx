import { FC } from 'react';
import { Flex, Spinner, Icon, Text, Button } from '@holium/design-system';
import {
  shortened,
  formatEthAmount,
  formatBtcAmount,
} from '../../../lib/helpers';
import { WalletActions } from 'renderer/logic/actions/wallet';
import {
  WalletView,
  TransactionType,
  ProtocolType,
} from 'os/services/tray/wallet-lib/wallet.model';
import { useTrayApps } from 'renderer/apps/store';
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
    <Flex px={1} mb={1} width="100%">
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
  const { walletApp } = useTrayApps();

  const goToTransaction = () => {
    WalletActions.navigate(WalletView.TRANSACTION_DETAIL, {
      walletIndex: props.transaction.walletIndex.toString(),
      detail: {
        type: 'transaction',
        txtype: walletApp.navState.detail?.txtype as TxType,
        coinKey: walletApp.navState.detail?.coinKey,
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
        ? walletApp.navState.protocol === ProtocolType.UQBAR
          ? 'zigs'
          : 'ETH'
        : walletApp.ethereum.wallets
            ?.get(props.transaction.walletIndex.toString())
            ?.data.get(walletApp.navState.protocol)
            ?.coins.get(props.transaction.ethType)?.name ?? '';
  }

  return (
    <Flex
      mx={2}
      py={2}
      px={2}
      width="100%"
      justifyContent="space-between"
      borderRadius="9px"
    >
      <Flex
        mx={2}
        justifyContent="center"
        alignItems="center"
        onClick={goToTransaction}
      >
        <Flex mr={4} height="100%" alignItems="center">
          <Spinner size={0} />
        </Flex>
        <Flex flexDirection="column">
          <Text.Body variant="body">
            {props.transaction.type === 'sent' ? 'Sending' : 'Receiving'}{' '}
            {isEth ? ethAmount.eth : btcAmount.btc} {unitsDisplay}
          </Text.Body>
          <Text.Body pt={1} variant="body" fontSize={1}>
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
