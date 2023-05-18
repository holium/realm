import { Flex, Text } from '@holium/design-system/general';

import {
  TransactionType,
  WalletNavOptions,
} from 'renderer/stores/models/wallet.model';

import { convertEthAmountToUsd, EthAmount } from '../../helpers';
import { TxType, WalletScreen } from '../../types';
import { Transaction } from './Transaction';

type Props = {
  transactions: TransactionType[];
  txType?: string;
  coinKey?: string;
  ethAmount?: EthAmount;
  ethType?: string;
  ethToUsd?: number;
  navigate: (view: WalletScreen, options?: WalletNavOptions) => void;
};

export const TransactionList = ({
  ethType,
  ethToUsd,
  transactions: unfilteredTransactions,
  txType,
  coinKey,
  ethAmount,
  navigate,
}: Props) => {
  let transactions = unfilteredTransactions;

  if (ethType === 'ETH') {
    transactions = unfilteredTransactions.filter(
      (tx) => tx.ethType === ethType
    );
  }

  if (!transactions.length) {
    return <Text.H5>No transactions</Text.H5>;
  }

  return (
    <Flex
      flex={1}
      minHeight="160px"
      width="100%"
      flexDirection="column"
      overflowY="auto"
    >
      {transactions.map((transaction, index) => (
        <Transaction
          key={`transaction-${index}`}
          isCoin={ethType !== undefined}
          transaction={transaction}
          usdAmountDisplay={
            ethAmount
              ? `${convertEthAmountToUsd(ethAmount, ethToUsd)} USD`
              : '0.00 USD'
          }
          onClick={() => {
            navigate(WalletScreen.TRANSACTION_DETAIL, {
              detail: {
                type: 'transaction',
                txtype: (txType as TxType) || 'general',
                coinKey,
                key: transaction.hash,
              },
            });
          }}
        />
      ))}
    </Flex>
  );
};
