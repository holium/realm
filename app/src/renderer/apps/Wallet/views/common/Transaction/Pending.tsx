import { FC } from 'react';
import { darken, lighten } from 'polished';

import { Flex, Icons, Text, Spinner } from 'renderer/components';
import { useServices } from 'renderer/logic/store';
import {
  shortened,
  getBaseTheme,
  formatEthAmount,
  formatBtcAmount,
} from '../../../lib/helpers';
import { WalletActions } from 'renderer/logic/actions/wallet';
import { WalletView } from 'os/services/tray/wallet.model';
import { TransactionType } from 'os/services/tray/wallet.model';

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

  return (
    <Flex mt={4} width="100%">
      {pendingTransactions.length ? (
        <PendingTransaction
          transaction={pendingTransactions[0]}
          hide={props.hide}
        />
      ) : (
        <></>
      )}
    </Flex>
  );
};

interface PendingTransactionProps {
  transaction: TransactionType;
  hide: any;
}
export const PendingTransaction: FC<PendingTransactionProps> = (
  props: PendingTransactionProps
) => {
  const { theme } = useServices();
  const { colors } = getBaseTheme(theme.currentTheme);

  const goToTransaction = () => {
    WalletActions.navigate(WalletView.TRANSACTION_DETAIL,
      {
        walletIndex: props.transaction.walletIndex.toString(),
        detail: { type: 'transaction', key: props.transaction.hash },
      }
    );
  };

  let isEth = props.transaction.network === 'ethereum';
  let ethAmount = formatEthAmount(isEth ? props.transaction.amount : '1');
  let btcAmount = formatBtcAmount(!isEth ? props.transaction.amount : '1');
  let themDisplay =
    props.transaction.theirPatp || shortened(props.transaction.theirAddress);

  return (
    <Flex
      mx={2}
      p={3}
      width="100%"
      justifyContent="space-between"
      background={
        theme.currentTheme.mode == 'light'
          ? darken(0.04, theme.currentTheme.windowColor)
          : lighten(0.02, theme.currentTheme.windowColor)
      }
      borderRadius="9px"
    >
      <Flex
        justifyContent="center"
        alignItems="center"
        onClick={goToTransaction}
      >
        <Flex pl={2} pr={3} height="100%" alignItems="center">
          <Spinner size={1} color={colors.brand.primary} />
        </Flex>
        <Flex flexDirection="column">
          <Text variant="body" color={colors.brand.primary}>
            {props.transaction.type === 'sent' ? 'Sending' : 'Receiving'}{' '}
            {isEth ? `${ethAmount.eth} ETH` : `${btcAmount.btc} BTC`}
          </Text>
          <Text pt={1} variant="body" color={colors.text.disabled} fontSize={1}>
            {props.transaction.type === 'sent' ? 'To:' : 'From:'} {themDisplay}{' '}
            <Icons ml="7px" name="ShareBox" size="15px" />
          </Text>
        </Flex>
      </Flex>
      <Flex justifyContent="center" alignItems="center" pr={2}>
        <Text
          variant="body"
          color={colors.brand.primary}
          fontSize={3}
          onClick={props.hide}
        >
          x
        </Text>
      </Flex>
    </Flex>
  );
};
