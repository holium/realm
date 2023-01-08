import { FC, useMemo } from 'react';
import { darken, lighten } from 'polished';
import { Flex, Icons, Text, Spinner, IconButton } from 'renderer/components';
import { useServices } from 'renderer/logic/store';
import {
  shortened,
  getBaseTheme,
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
        new Date(a.initiatedAt!).getTime() - new Date(b.initiatedAt!).getTime()
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
  const { theme } = useServices();
  const { walletApp } = useTrayApps();
  const { colors } = getBaseTheme(theme.currentTheme);

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
            .get(props.transaction.walletIndex.toString())!
            .data.get(walletApp.navState.protocol)!
            .coins.get(props.transaction.ethType!)!.name;
  }

  const bgColor = useMemo(
    () =>
      theme.currentTheme.mode === 'light'
        ? darken(0.04, theme.currentTheme.windowColor)
        : lighten(0.02, theme.currentTheme.windowColor),
    [theme.currentTheme.windowColor]
  );

  return (
    <Flex
      mx={2}
      py={2}
      px={2}
      width="100%"
      justifyContent="space-between"
      background={bgColor}
      borderRadius="9px"
    >
      <Flex
        mx={2}
        justifyContent="center"
        alignItems="center"
        onClick={goToTransaction}
      >
        <Flex mr={4} height="100%" alignItems="center">
          <Spinner size={0} color={colors.brand.primary} />
        </Flex>
        <Flex flexDirection="column">
          <Text variant="body" color={colors.brand.primary}>
            {props.transaction.type === 'sent' ? 'Sending' : 'Receiving'}{' '}
            {isEth ? ethAmount.eth : btcAmount.btc} {unitsDisplay}
          </Text>
          <Text pt={1} variant="body" color={colors.text.disabled} fontSize={1}>
            {props.transaction.type === 'sent' ? 'To:' : 'From:'} {themDisplay}{' '}
            <Icons ml="7px" name="ShareBox" size="15px" />
          </Text>
        </Flex>
      </Flex>
      <Flex justifyContent="center" alignItems="center">
        <IconButton onClick={props.hide} mr={1}>
          <Icons
            opacity={0.7}
            name="Close"
            size="15px"
            color={colors.text.disabled}
          />
        </IconButton>
      </Flex>
    </Flex>
  );
};
