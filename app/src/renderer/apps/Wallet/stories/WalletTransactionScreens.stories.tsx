import { ComponentMeta, ComponentStory } from '@storybook/react';

import {
  NetworkType,
  ProtocolType,
} from 'os/services/ship/wallet/wallet.types';

import { DetailScreenBody } from '../screens/DetailScreen/DetailScreenBody';
import { TransactionDetailScreenBody } from '../screens/TransactionDetailScreen/TransactionDetailScreenBody';
import { WalletScreen } from '../types';
import { WalletStoryWrapper } from './helper';
import {
  mockBitcoin,
  mockBitcoinCoin,
  mockCryptoPunkNft,
  mockEthereum,
  mockShibaCoin,
  mockStarNft,
  mockTransactions,
  mockWallets,
} from './mockData';

export default {
  component: TransactionDetailScreenBody,
  title: 'Wallet/Transaction Screens',
} as ComponentMeta<typeof TransactionDetailScreenBody>;

export const SendStory: ComponentStory<typeof DetailScreenBody> = () => (
  <WalletStoryWrapper protocol={ProtocolType.ETH_GORLI}>
    <DetailScreenBody
      wallet={mockWallets[0]}
      coin={null}
      transactions={mockTransactions}
      coins={[mockShibaCoin, mockBitcoinCoin]}
      nfts={[mockStarNft, mockCryptoPunkNft]}
      network={NetworkType.ETHEREUM}
      protocol={ProtocolType.ETH_GORLI}
      bitcoin={mockBitcoin}
      ethereum={mockEthereum}
      ethToUsd={mockEthereum.conversions.usd}
      screen={WalletScreen.TRANSACTION_SEND}
      to="~zod"
      getRecipient={() => Promise.resolve({} as any)}
      checkPasscode={() => Promise.resolve(true)}
      sendEthereumTransaction={() => Promise.resolve(false)}
      onClickNavigateBack={() => {}}
      sendERC20Transaction={() => Promise.resolve(false)}
      navigate={() => {}}
      close={() => {}}
    />
  </WalletStoryWrapper>
);

SendStory.storyName = 'Send';

export const ConfirmStory: ComponentStory<typeof DetailScreenBody> = () => (
  <WalletStoryWrapper protocol={ProtocolType.ETH_GORLI}>
    <DetailScreenBody
      wallet={mockWallets[0]}
      coin={null}
      transactions={mockTransactions}
      coins={[mockShibaCoin, mockBitcoinCoin]}
      nfts={[mockStarNft, mockCryptoPunkNft]}
      network={NetworkType.ETHEREUM}
      protocol={ProtocolType.ETH_GORLI}
      bitcoin={mockBitcoin}
      ethereum={mockEthereum}
      ethToUsd={mockEthereum.conversions.usd}
      screen={WalletScreen.TRANSACTION_CONFIRM}
      to="~zod"
      getRecipient={() => Promise.resolve({} as any)}
      checkPasscode={() => Promise.resolve(true)}
      sendEthereumTransaction={() => Promise.resolve(false)}
      onClickNavigateBack={() => {}}
      sendERC20Transaction={() => Promise.resolve(false)}
      navigate={() => {}}
      close={() => {}}
    />
  </WalletStoryWrapper>
);

ConfirmStory.storyName = 'Confirm';

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
      amountDisplay="1 ETH"
      usdAmount="1"
    />
  </WalletStoryWrapper>
);

TransactionDetailStory.storyName = 'Transaction detail';
