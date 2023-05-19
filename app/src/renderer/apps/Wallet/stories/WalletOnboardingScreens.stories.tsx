import { ComponentMeta, ComponentStory } from '@storybook/react';

import {
  NetworkType,
  ProtocolType,
} from 'os/services/ship/wallet/wallet.types';

import { BackupScreen } from '../screens/BackupScreen';
import { ConfirmPasscodeScreen } from '../screens/ConfirmPasscodeScreen';
import { ConfirmScreen } from '../screens/ConfirmScreen';
import { CreatePasscodeScreen } from '../screens/CreatePasscodeScreen';
import { FinalizingScreenBody } from '../screens/FinalizingScreen/FinalizingScreenBody';
import { NoWalletFoundScreen } from '../screens/NoWalletFoundScreen';
import { WalletListScreenBody } from '../screens/WalletListScreen/WalletListScreenBody';
import { WalletStoryWrapper } from './helper';

export default {
  component: NoWalletFoundScreen,
  title: 'Wallet/Onboarding Screens',
} as ComponentMeta<typeof NoWalletFoundScreen>;

export const CreateOrImportStory: ComponentStory<
  typeof NoWalletFoundScreen
> = () => (
  <WalletStoryWrapper isOnboarding>
    <NoWalletFoundScreen setScreen={() => {}} />
  </WalletStoryWrapper>
);

CreateOrImportStory.storyName = '1. No wallet found';

export const BackUpWalletStory: ComponentStory<typeof BackupScreen> = () => (
  <WalletStoryWrapper isOnboarding>
    <BackupScreen
      seedPhrase="route way orange glass jar wing social album tag raven august miracle"
      setSeedPhrase={() => {}}
      setScreen={() => {}}
    />
  </WalletStoryWrapper>
);

BackUpWalletStory.storyName = '2. Back up your wallet';

export const ConfirmStory: ComponentStory<typeof ConfirmScreen> = () => (
  <WalletStoryWrapper isOnboarding>
    <ConfirmScreen
      seedPhrase="route way orange glass jar wing social album tag raven august miracle"
      setScreen={() => {}}
    />
  </WalletStoryWrapper>
);

ConfirmStory.storyName = '3. Confirm words';

export const CreatePasscodeStory: ComponentStory<
  typeof CreatePasscodeScreen
> = () => (
  <WalletStoryWrapper isOnboarding>
    <CreatePasscodeScreen
      checkPasscode={() => Promise.resolve(false)}
      setPasscode={() => Promise.resolve()}
    />
  </WalletStoryWrapper>
);

CreatePasscodeStory.storyName = '4. Set a passcode';

export const ConfirmPasscodeStory: ComponentStory<
  typeof ConfirmPasscodeScreen
> = () => (
  <WalletStoryWrapper isOnboarding>
    <ConfirmPasscodeScreen
      correctPasscode={[1, 2, 3, 4, 5, 6]}
      checkPasscode={() => Promise.resolve(false)}
      onSuccess={() => Promise.resolve()}
    />
  </WalletStoryWrapper>
);

ConfirmPasscodeStory.storyName = '5. Confirm passcode';

export const CreatingWalletStory: ComponentStory<
  typeof FinalizingScreenBody
> = () => (
  <WalletStoryWrapper isOnboarding>
    <FinalizingScreenBody />
  </WalletStoryWrapper>
);

CreatingWalletStory.storyName = '6. Creating wallet...';

export const NoAddressesStory: ComponentStory<
  typeof WalletListScreenBody
> = () => (
  <WalletStoryWrapper
    protocol={ProtocolType.ETH_GORLI}
    isOnboarding={false}
    hideBack
  >
    <WalletListScreenBody
      wallets={[]}
      network={NetworkType.ETHEREUM}
      protocol={ProtocolType.ETH_GORLI}
      onSelectAddress={() => {}}
      onClickCreateAddress={() => {}}
    />
  </WalletStoryWrapper>
);

NoAddressesStory.storyName = '7. No addresses';
