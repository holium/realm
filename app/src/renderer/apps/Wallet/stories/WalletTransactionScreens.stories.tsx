import { ComponentMeta, ComponentStory } from '@storybook/react';

import { ProtocolType } from 'os/services/ship/wallet/wallet.types';

import { TransactionDetailScreenBody } from '../screens/TransactionDetailScreen/TransactionDetailScreenBody';
import { WalletStoryWrapper } from './helper';

export default {
  component: TransactionDetailScreenBody,
  title: 'Wallet/Transaction Screens',
} as ComponentMeta<typeof TransactionDetailScreenBody>;

export const TransactionDetailStory: ComponentStory<
  typeof TransactionDetailScreenBody
> = () => (
  <WalletStoryWrapper protocol={ProtocolType.ETH_GORLI}>
    <TransactionDetailScreenBody
      wasSent={true}
      themDisplay="0x1234567890"
      completedAtString="2021-09-01"
      transactionHash="0x1234567890"
      patp="~zod"
      transactionNotes="test"
      transactionStatus="test"
      protocol={ProtocolType.ETH_GORLI}
      saveTransactionNotes={() => Promise.resolve()}
      amountDisplay="1"
      usdAmount="1"
    />
  </WalletStoryWrapper>
);

TransactionDetailStory.storyName = 'Transaction detail';
