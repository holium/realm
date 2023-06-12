import { ComponentMeta, ComponentStory } from '@storybook/react';

import {
  NetworkType,
  ProtocolType,
} from 'os/services/ship/wallet/wallet.types';

import { WalletListScreenBody } from '../screens/Base/WalletListScreen/WalletListScreenBody';
import { BackupScreen } from '../screens/Onboarding/BackupScreen';
import { CancelWalletCreationScreen } from '../screens/Onboarding/CancelWalletCreationScreen';
import { ConfirmPasscodeScreen } from '../screens/Onboarding/ConfirmPasscodeScreen';
import { ConfirmScreen } from '../screens/Onboarding/ConfirmScreen';
import { CreatePasscodeScreen } from '../screens/Onboarding/CreatePasscodeScreen';
import { DetectedExistingScreen } from '../screens/Onboarding/DetectedExistingScreen';
import { FinalizingScreenBody } from '../screens/Onboarding/FinalizingScreen/FinalizingScreenBody';
import { ImportExistingScreen } from '../screens/Onboarding/ImportExistingScreen/ImportExistingScreen';
import { NoWalletFoundScreen } from '../screens/Onboarding/NoWalletFoundScreen';
import { RecoverExistingScreen } from '../screens/Onboarding/RecoverExistingScreen/RecoverExistingScreen';
import { RecoverExistingScreenBody } from '../screens/Onboarding/RecoverExistingScreen/RecoverExistingScreenBody';
import { WalletStoryWrapper } from './helper';

/* TODO: ImportScreen in storybook */

export default {
  component: NoWalletFoundScreen,
  title: 'Wallet/Onboarding Screens',
} as ComponentMeta<typeof NoWalletFoundScreen>;

export const DetectedExistingScreenStory: ComponentStory<
  typeof DetectedExistingScreen
> = () => (
  <WalletStoryWrapper isOnboarding>
    <DetectedExistingScreen setScreen={() => {}} />
  </WalletStoryWrapper>
);

DetectedExistingScreenStory.storyName = '0. Detected existing wallet';

export const CancelWalletCreationStory: ComponentStory<
  typeof CancelWalletCreationScreen
> = () => (
  <WalletStoryWrapper isOnboarding>
    <CancelWalletCreationScreen
      onClickCancel={() => {}}
      onClickDelete={() => {}}
    />
  </WalletStoryWrapper>
);

CancelWalletCreationStory.storyName = '0. Cancel wallet creation';

export const ImportExistingScreenStory: ComponentStory<
  typeof ImportExistingScreen
> = () => (
  <WalletStoryWrapper isOnboarding>
    <ImportExistingScreen setScreen={() => {}} setSeedPhrase={() => {}} />
  </WalletStoryWrapper>
);

ImportExistingScreenStory.storyName = '1. Import existing wallet';

export const RecoverExistingScreenStory: ComponentStory<
  typeof RecoverExistingScreen
> = () => (
  <WalletStoryWrapper isOnboarding>
    <RecoverExistingScreenBody
      phrase={''}
      updatePhrase={() => {}}
      recoverSeedPhrase={async () => {}}
      checkPasscode={async () => true}
      showPasscode={false}
      setShowPasscode={() => {}}
      error={''}
      loading={false}
      setScreen={() => {}}
    />
  </WalletStoryWrapper>
);

RecoverExistingScreenStory.storyName = '1. Recover existing wallet';

export const NoWalletFoundStory: ComponentStory<
  typeof NoWalletFoundScreen
> = () => (
  <WalletStoryWrapper isOnboarding>
    <NoWalletFoundScreen setScreen={() => {}} />
  </WalletStoryWrapper>
);

NoWalletFoundStory.storyName = '2. No wallet found';

export const BackUpWalletStory: ComponentStory<typeof BackupScreen> = () => (
  <WalletStoryWrapper isOnboarding>
    <BackupScreen
      seedPhrase="route way orange glass jar wing social album tag raven august miracle"
      setSeedPhrase={() => {}}
      setScreen={() => {}}
    />
  </WalletStoryWrapper>
);

BackUpWalletStory.storyName = '3. Back up your wallet';

export const ConfirmStory: ComponentStory<typeof ConfirmScreen> = () => (
  <WalletStoryWrapper isOnboarding>
    <ConfirmScreen
      seedPhrase="route way orange glass jar wing social album tag raven august miracle"
      setScreen={() => {}}
    />
  </WalletStoryWrapper>
);

ConfirmStory.storyName = '4. Confirm words';

export const CreatePasscodeStory: ComponentStory<
  typeof CreatePasscodeScreen
> = () => (
  <WalletStoryWrapper isOnboarding>
    <CreatePasscodeScreen
      passcode={[]}
      checkPasscode={() => Promise.resolve(false)}
      setPasscode={() => Promise.resolve()}
      setScreen={() => {}}
    />
  </WalletStoryWrapper>
);

CreatePasscodeStory.storyName = '5. Set a passcode';

export const ConfirmPasscodeStory: ComponentStory<
  typeof ConfirmPasscodeScreen
> = () => (
  <WalletStoryWrapper isOnboarding>
    <ConfirmPasscodeScreen
      correctPasscode={[1, 2, 3, 4, 5, 6]}
      checkPasscode={() => Promise.resolve(false)}
      setScreen={() => {}}
      canContinue={false}
      setCanContinue={() => {}}
    />
  </WalletStoryWrapper>
);

ConfirmPasscodeStory.storyName = '6. Confirm passcode';

export const CreatingWalletStory: ComponentStory<
  typeof FinalizingScreenBody
> = () => (
  <WalletStoryWrapper isOnboarding>
    <FinalizingScreenBody stuck setScreen={() => {}} />
  </WalletStoryWrapper>
);

CreatingWalletStory.storyName = '7. Creating wallet...';

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

NoAddressesStory.storyName = '8. No addresses';
