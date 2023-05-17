import { ComponentMeta, ComponentStory } from '@storybook/react';

import {
  NetworkType,
  ProtocolType,
  SharingMode,
  WalletCreationMode,
} from 'os/services/ship/wallet/wallet.types';

import { CreateWalletScreenBody } from '../screens/CreateWalletScreen/CreateWalletScreenBody';
import { WalletListScreenBody } from '../screens/WalletListScreen/WalletListScreenBody';
import { WalletSettingsScreenBody } from '../screens/WalletSettingsScreen/WalletSettingsScreenBody';
import { mockWallets, WalletStoryWrapper } from './helper';

export default {
  component: WalletSettingsScreenBody,
  title: 'Wallet/Base Screens',
} as ComponentMeta<typeof WalletSettingsScreenBody>;

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

export const WalletList: ComponentStory<typeof WalletListScreenBody> = () => (
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

WalletList.storyName = 'My addresses';

export const SettingsStory: ComponentStory<
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

SettingsStory.storyName = 'Settings';
