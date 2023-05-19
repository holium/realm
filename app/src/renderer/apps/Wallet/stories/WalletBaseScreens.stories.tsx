import { ComponentMeta, ComponentStory } from '@storybook/react';

import {
  NetworkType,
  ProtocolType,
  SharingMode,
  WalletCreationMode,
} from 'os/services/ship/wallet/wallet.types';

import { CreateWalletScreenBody } from '../screens/CreateWalletScreen/CreateWalletScreenBody';
import { DetailScreenBody } from '../screens/DetailScreen/DetailScreenBody';
import { ForgotPasscodeScreenBody } from '../screens/ForgotPasscodeScreen/ForgotPasscodeScreenBody';
import { LockedScreenBody } from '../screens/LockedScreen/LockedScreenBody';
import { NFTDetailScreenBody } from '../screens/NFTDetailScreen/NFTDetailScreenBody';
import { WalletListScreenBody } from '../screens/WalletListScreen/WalletListScreenBody';
import { WalletSettingsScreenBody } from '../screens/WalletSettingsScreen/WalletSettingsScreenBody';
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
  component: WalletSettingsScreenBody,
  title: 'Wallet/Base Screens',
} as ComponentMeta<typeof WalletSettingsScreenBody>;

export const WalletDetailssStory: ComponentStory<
  typeof DetailScreenBody
> = () => (
  <WalletStoryWrapper protocol={ProtocolType.ETH_GORLI}>
    <DetailScreenBody
      wallet={mockWallets[0]}
      coin={mockShibaCoin}
      transactions={mockTransactions}
      coins={[mockShibaCoin, mockBitcoinCoin]}
      nfts={[mockStarNft, mockCryptoPunkNft]}
      network={NetworkType.ETHEREUM}
      protocol={ProtocolType.ETH_GORLI}
      bitcoin={mockBitcoin}
      ethereum={mockEthereum}
      ethToUsd={mockEthereum.conversions.usd}
      screen={WalletScreen.WALLET_DETAIL}
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

WalletDetailssStory.storyName = 'Wallet details';

export const NftDetailStory: ComponentStory<
  typeof NFTDetailScreenBody
> = () => (
  <WalletStoryWrapper protocol={ProtocolType.ETH_GORLI}>
    <NFTDetailScreenBody
      nftName={mockStarNft.name}
      nftImageUrl={mockStarNft.imageUrl}
      nftAddress={mockStarNft.address}
      nftTokenId={mockStarNft.tokenId}
      nftCollectionName={mockStarNft.collectionName}
    />
  </WalletStoryWrapper>
);

NftDetailStory.storyName = 'NFT detail';

export const WalletListStory: ComponentStory<
  typeof WalletListScreenBody
> = () => (
  <WalletStoryWrapper
    protocol={ProtocolType.ETH_GORLI}
    isOnboarding={false}
    hideBack
  >
    <WalletListScreenBody
      wallets={mockWallets}
      network={NetworkType.ETHEREUM}
      protocol={ProtocolType.ETH_GORLI}
      onSelectAddress={() => {}}
      onClickCreateAddress={() => {}}
    />
  </WalletStoryWrapper>
);

WalletListStory.storyName = 'My addresses';

export const CreateWalletStory: ComponentStory<
  typeof CreateWalletScreenBody
> = () => (
  <WalletStoryWrapper protocol={ProtocolType.ETH_GORLI} isOnboarding={false}>
    <CreateWalletScreenBody
      network={NetworkType.ETHEREUM}
      loading={false}
      nickname="My wallet"
      onChangeNickname={() => {}}
      onClickCreate={() => {}}
    />
  </WalletStoryWrapper>
);

CreateWalletStory.storyName = 'Create address';

export const WalletSettingsStory: ComponentStory<
  typeof WalletSettingsScreenBody
> = () => (
  <WalletStoryWrapper protocol={ProtocolType.ETH_GORLI} hideHeader hideFooter>
    <WalletSettingsScreenBody
      wallets={mockWallets}
      saving={false}
      creationMode="default"
      onClickCreationMode={() => {}}
      blocked={['~zod', '~bus']}
      onChangeBlockList={() => {}}
      sharingMode={SharingMode.NOBODY}
      defaultIndex={0}
      walletCreationMode={WalletCreationMode.DEFAULT}
      setWalletVisibility={() => {}}
      onClickDeleteLocally={() => {}}
      onClickDeleteCompletely={() => {}}
      onClickBack={() => {}}
      onClickSaveSettings={() => {}}
    />
  </WalletStoryWrapper>
);

WalletSettingsStory.storyName = 'Settings';

export const LockedStory: ComponentStory<typeof LockedScreenBody> = () => (
  <WalletStoryWrapper protocol={ProtocolType.ETH_GORLI} hideHeader hideFooter>
    <LockedScreenBody
      onClickForgotPasscode={() => {}}
      checkPasscode={() => Promise.resolve(true)}
      onSuccess={() => {}}
    />
  </WalletStoryWrapper>
);

LockedStory.storyName = 'Locked';

export const ForgotPasscodeStory: ComponentStory<
  typeof ForgotPasscodeScreenBody
> = () => (
  <WalletStoryWrapper protocol={ProtocolType.ETH_GORLI} hideHeader hideFooter>
    <ForgotPasscodeScreenBody
      onClickCancel={() => {}}
      onClickDelete={() => {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve();
          }, 1000);
        });
      }}
    />
  </WalletStoryWrapper>
);

ForgotPasscodeStory.storyName = 'Forgot passcode';
