import { Flex, Icon, NoScrollBar, Text } from '@holium/design-system/general';

import {
  TransactionType,
  WalletNavOptions,
} from 'renderer/stores/models/wallet.model';

import { convertEthAmountToUsd, EthAmount } from '../../helpers';
import { TxType, WalletScreen } from '../../types';
import { Transaction } from './Transaction';

type Props = {
  height: number;
  transactions: TransactionType[];
  txType?: string;
  coinKey?: string;
  ethAmount?: EthAmount;
  ethType?: string;
  ethToUsd?: number;
  navigate: (view: WalletScreen, options?: WalletNavOptions) => void;
};

export const TransactionList = ({
  height,
  ethType,
  ethToUsd,
  transactions: unfilteredTransactions,
  txType,
  coinKey,
  ethAmount,
  navigate,
}: Props) => {
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
              usdAmountDisplay={
                ethAmount
                  ? `${convertEthAmountToUsd(ethAmount, ethToUsd)} USD`
                  : undefined
              }
              onClick={() =>
                navigate(WalletScreen.TRANSACTION_DETAIL, {
                  detail: {
                    type: 'transaction',
                    txtype: (txType as TxType) || 'general',
                    coinKey,
                    key: transaction.hash,
                  },
                })
              }
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
