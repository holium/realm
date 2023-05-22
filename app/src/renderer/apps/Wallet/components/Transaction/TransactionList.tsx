import { Flex, Text } from '@holium/design-system/general';

import {
  TransactionType,
  WalletNavOptions,
} from 'renderer/stores/models/wallet.model';

import { EthAmount } from '../../helpers';
import { TxType, WalletScreen } from '../../types';
import { Transaction } from './Transaction';

type Props = {
  transactions: TransactionType[];
  ethPrice: number | undefined;
  bitcoinPrice: number | undefined;
  txType?: string;
  coinKey?: string;
  ethAmount?: EthAmount;
  ethType?: string;
  navigate: (view: WalletScreen, options?: WalletNavOptions) => void;
};

export const TransactionList = ({
  transactions: unfilteredTransactions,
  ethPrice,
  bitcoinPrice,
  ethType,
  txType,
  coinKey,
  navigate,
}: Props) => {
  let transactions = unfilteredTransactions;
  if (ethType === 'ETH') {
    transactions = unfilteredTransactions.filter(
      (tx) => tx.ethType === ethType
    );
  }

  if (!transactions.length) {
    return <Text.H5 mt="4px">No transactions</Text.H5>;
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
          ethPrice={ethPrice}
          bitcoinPrice={bitcoinPrice}
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
