import { Flex } from '@holium/design-system/general';

import { TransactionType } from 'renderer/stores/models/wallet.model';

import { PendingTransaction } from './PendingTransaction';

type Props = {
  transactions: TransactionType[];
  hide: () => void;
};

export const PendingTransactionDisplay = ({ transactions, hide }: Props) => {
  const pendingTransactions = transactions
    .filter((t) => t.status === 'pending')
    .sort(
      (a, b) =>
        new Date(a.initiatedAt ?? 0).getTime() -
        new Date(b.initiatedAt ?? 0).getTime()
    );

  if (!pendingTransactions.length) return null;

  return (
    <Flex width="100%">
      <PendingTransaction transaction={pendingTransactions[0]} hide={hide} />
    </Flex>
  );
};
