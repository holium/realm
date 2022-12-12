import { useEffect, useMemo, useState } from 'react';
import { observer } from 'mobx-react';
import styled from 'styled-components';
import { darken } from 'polished';
import { Flex, Icons, Text } from 'renderer/components';
import { Row } from 'renderer/components/NewRow';
import { useServices } from 'renderer/logic/store';
import { useTrayApps } from 'renderer/apps/store';
import {
  shortened,
  monthNames,
  formatEthAmount,
  formatBtcAmount,
  convertEthAmountToUsd,
  convertBtcAmountToUsd,
  getTransactions,
} from '../../../lib/helpers';
import { WalletActions } from 'renderer/logic/actions/wallet';
import {
  TransactionType,
  WalletView,
  EthWalletType,
} from 'os/services/tray/wallet-lib';

const NoScrollBar = styled(Flex)`
  ::-webkit-scrollbar {
    display: none;
  }
`;
interface InputProps {
  hoverBg: string;
}

interface TransactionProps {
  transaction: TransactionType;
}
export const Transaction = observer((props: TransactionProps) => {
  const { theme } = useServices();
  const { walletApp } = useTrayApps();
  const hoverBackground = darken(0.0325, theme.currentTheme.windowColor);

  const { transaction } = props;
  const wasSent = transaction.type === 'sent';
  const isEth = transaction.network === 'ethereum';
  const themDisplay =
    transaction.theirPatp || shortened(transaction.theirAddress);
  const completedDate = new Date(
    transaction.completedAt || transaction.initiatedAt || 0
  );

  const ethAmount = formatEthAmount(isEth ? transaction.amount : '1');
  const btcAmount = formatBtcAmount(!isEth ? transaction.amount : '1');

  const onClick = () => {
    WalletActions.navigate(WalletView.TRANSACTION_DETAIL, {
      detail: { type: 'transaction', key: transaction.hash },
    });
  };

  return (
    <Row customBg={hoverBackground} onClick={onClick}>
      <Flex width="100%" justifyContent="space-between" alignItems="center">
        <Flex flexDirection="column" justifyContent="center">
          <Text variant="h5" fontSize={3}>
            {transaction.status !== 'pending'
              ? wasSent
                ? 'Sent'
                : 'Received'
              : wasSent
              ? 'Sending'
              : 'Receiving'}
          </Text>
          <Flex>
            <Text
              variant="body"
              fontSize={1}
              color={
                transaction.status !== 'pending'
                  ? wasSent
                    ? 'text.error'
                    : 'text.success'
                  : 'brand.primary'
              }
            >
              {`${
                monthNames[completedDate.getMonth()]
              } ${completedDate.getDate()}`}
            </Text>
            <Text mx={1} variant="body" fontSize={1} color="text.disabled">
              ·
            </Text>
            <Text variant="body" fontSize={1} color="text.disabled">
              {wasSent ? 'To:' : 'From:'} {themDisplay}
            </Text>
          </Flex>
        </Flex>
        <Flex
          flexDirection="column"
          justifyContent="center"
          alignItems="flex-end"
        >
          <Text variant="body" fontSize={2}>
            {transaction.type === 'sent' ? '-' : ''}{' '}
            {isEth ? `${ethAmount.eth}` /* ETH` */ : `${btcAmount.btc} BTC`}
          </Text>
          <Text variant="body" fontSize={1} color="text.disabled">
            {transaction.type === 'sent' ? '-' : ''}$
            {isEth
              ? convertEthAmountToUsd(
                  ethAmount,
                  walletApp.ethereum.conversions.usd
                )
              : convertBtcAmountToUsd(
                  btcAmount,
                  walletApp.bitcoin.conversions.usd
                )}{' '}
            USD
          </Text>
        </Flex>
      </Flex>
    </Row>
  );
});

interface TransactionListProps {
  transactions: TransactionType[];
  hidePending: boolean;
  ethType?: string;
}
export const TransactionList = observer((props: TransactionListProps) => {
  const { theme } = useServices();
  const { walletApp } = useTrayApps();
  // const {walletApp} = useTrayApps();

  const pending = props.transactions.filter(
    (trans) => trans.status === 'pending'
  ).length;

  let transactions = props.transactions;
  if (props.ethType === 'ETH') {
    transactions = props.transactions.filter((tx) =>
      props.ethType ? tx.ethType === props.ethType : true
    );
  }

  return (
    <>
      <NoScrollBar
        width="100%"
        height={pending && !props.hidePending ? '165px' : '210px'}
        flexDirection="column"
        margin="auto"
        overflow="scroll"
      >
        {transactions.length ? (
          transactions.map((transaction, index) => (
            <Transaction key={index} transaction={transaction} />
          ))
        ) : (
          <Text
            mt={6}
            variant="h5"
            textAlign="center"
            color={theme.currentTheme.iconColor}
          >
            No transactions
          </Text>
        )}
      </NoScrollBar>
      {transactions.length > 3 && (
        <Flex pt={1} width="100%" justifyContent="center">
          <Icons
            name="ChevronDown"
            size={1}
            color={theme.currentTheme.iconColor}
          />
        </Flex>
      )}
    </>
  );
});
