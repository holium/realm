import { ComponentMeta, ComponentStory } from '@storybook/react';

import {
  NetworkType,
  ProtocolType,
} from 'os/services/ship/wallet/wallet.types';

import { DetailScreenBody } from '../screens/Base/DetailScreen/DetailScreenBody';
import { SubmitTransactionPasscodeScreen } from '../screens/Base/DetailScreen/SubmitTransactionPasscodeScreen';
import { TransactionDetailScreenBody } from '../screens/Base/TransactionDetailScreen/TransactionDetailScreenBody';
import { WalletScreen } from '../types';
import { WalletStoryWrapper } from './helper';
import {
  mockBitcoinCoin,
  mockCryptoPunkNft,
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
      ethPrice={1725.0}
      bitcoinPrice={1725.0}
      screen={WalletScreen.TRANSACTION_SEND}
      to="~zod"
      getRecipient={() => Promise.resolve({} as any)}
      checkPasscode={() => Promise.resolve(true)}
      sendEthereumTransaction={() => Promise.resolve()}
      onClickNavigateBack={() => {}}
      sendERC20Transaction={() => Promise.resolve()}
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
      ethPrice={1725.0}
      bitcoinPrice={1725.0}
      screen={WalletScreen.TRANSACTION_CONFIRM}
      to="0x1234567890"
      getRecipient={() => Promise.resolve({} as any)}
      checkPasscode={() => Promise.resolve(true)}
      sendEthereumTransaction={() => Promise.resolve()}
      onClickNavigateBack={() => {}}
      sendERC20Transaction={() => Promise.resolve()}
      navigate={() => {}}
      close={() => {}}
    />
  </WalletStoryWrapper>
);

ConfirmStory.storyName = 'Confirm';

export const SubmitTransactionPasscodeStory: ComponentStory<
  typeof SubmitTransactionPasscodeScreen
> = () => (
  <WalletStoryWrapper protocol={ProtocolType.ETH_GORLI}>
    <SubmitTransactionPasscodeScreen
      sendError={false}
      checkPasscode={() => Promise.resolve(false)}
      onSuccess={() => Promise.resolve()}
    />
  </WalletStoryWrapper>
);

SubmitTransactionPasscodeStory.storyName = 'Submit transaction with passcode';

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
