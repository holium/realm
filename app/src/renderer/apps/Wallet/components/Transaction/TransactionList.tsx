import { observer } from 'mobx-react';

import {
  Flex,
  Icon,
  NoScrollBar,
  Row,
  Text,
} from '@holium/design-system/general';

import { TxType, WalletScreen } from 'renderer/apps/Wallet/types';
import { TransactionType } from 'renderer/stores/models/wallet.model';
import { useShipStore } from 'renderer/stores/ship.store';

import {
  convertEthAmountToUsd,
  formatBtcAmount,
  formatEthAmount,
  monthNames,
  shortened,
} from '../../helpers';

type Props = {
  transaction: TransactionType;
  isCoin?: boolean;
};

const TransactionPresenter = ({ transaction, isCoin }: Props) => {
  const { walletStore } = useShipStore();
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
    walletStore.navigate(WalletScreen.TRANSACTION_DETAIL, {
      detail: {
        type: 'transaction',
        txtype: (walletStore.navState.detail?.txtype as TxType) || 'general',
        coinKey: walletStore.navState.detail?.coinKey,
        key: transaction.hash,
      },
    });
  };

  return (
    <Row onClick={onClick}>
      <Flex width="100%" justifyContent="space-between" alignItems="center">
        <Flex flexDirection="column" justifyContent="center">
          <Text.Custom fontWeight={500} fontSize={3}>
            {transaction.status !== 'pending'
              ? wasSent
                ? 'Sent'
                : 'Received'
              : wasSent
              ? 'Sending'
              : 'Receiving'}
          </Text.Custom>
          <Flex>
            <Text.Body variant="body" fontSize={1}>
              {`${
                monthNames[completedDate.getMonth()]
              } ${completedDate.getDate()}`}
            </Text.Body>
            <Text.Body mx={1} variant="body" fontSize={1}>
              ·
            </Text.Body>
            <Text.Custom
              truncate
              width={130}
              variant="body"
              fontSize={1}
              opacity={0.5}
            >
              {wasSent ? 'To:' : 'From:'} {themDisplay}
            </Text.Custom>
          </Flex>
        </Flex>
        <Flex
          flexDirection="column"
          justifyContent="center"
          alignItems="flex-end"
        >
          <Text.Body fontSize={2}>
            {transaction.type === 'sent' ? '-' : ''}{' '}
            {isEth ? `${ethAmount.eth}` /* ETH` */ : `${btcAmount.btc} BTC`}
          </Text.Body>
          {!isCoin && (
            <Text.Hint opacity={0.5}>
              {transaction.type === 'sent' ? '-' : ''}$
              {isEth &&
                `${convertEthAmountToUsd(
                  ethAmount,
                  walletStore.ethereum.conversions.usd
                )} USD`}
            </Text.Hint>
          )}
        </Flex>
      </Flex>
    </Row>
  );
};

export const Transaction = observer(TransactionPresenter);

type TransactionListProps = {
  height: number;
  transactions: TransactionType[];
  ethType?: string;
};

const TransactionListPresenter = ({
  height,
  ethType,
  transactions: unfilteredTransactions,
}: TransactionListProps) => {
  const pending = unfilteredTransactions.filter(
    (tx) => tx.status === 'pending'
  ).length;

  let transactions = unfilteredTransactions;
  if (ethType === 'ETH') {
    transactions = unfilteredTransactions.filter((tx) =>
      ethType ? tx.ethType === ethType : true
    );
  }

  return (
    <>
      <NoScrollBar
        width="100%"
        height={pending ? height - 54 : height}
        flexDirection="column"
        margin="auto"
        overflow="auto"
      >
        {transactions.length ? (
          transactions.map((transaction, index) => (
            <Transaction
              isCoin={ethType !== undefined}
              key={index}
              transaction={transaction}
            />
          ))
        ) : (
          <Text.H5 variant="h5" textAlign="center">
            No transactions
          </Text.H5>
        )}
      </NoScrollBar>
      {transactions.length > 4 && (
        <Flex pt="2px" width="100%" justifyContent="center">
          <Icon name="ChevronDown" size={1} />
        </Flex>
      )}
    </>
  );
};

export const TransactionList = observer(TransactionListPresenter);
