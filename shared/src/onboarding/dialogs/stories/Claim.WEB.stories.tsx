import { ComponentMeta, ComponentStory } from '@storybook/react';

import { AccountDownloadRealmDialog } from '../AccountDownloadRealmDialog';
import { ClaimTokenDialog } from '../ClaimTokenDialog';
import { CreateAccountDialog } from '../CreateAccountDialog';
import { OnboardingDialogWrapper } from './helpers';

export default {
  component: CreateAccountDialog,
  title: 'Onboarding/Claim flow WEB',
} as ComponentMeta<typeof CreateAccountDialog>;

export const CreateAccountDialogStory: ComponentStory<
  typeof CreateAccountDialog
> = () => (
  <OnboardingDialogWrapper>
    <ClaimTokenDialog
      email="man@email.com"
      onAlreadyHaveAccount={() => {}}
      onClaim={() => Promise.resolve(false)}
    />
  </OnboardingDialogWrapper>
);

CreateAccountDialogStory.storyName = '1. Claim token';

export const AccountDownloadRealmDialogStory: ComponentStory<
  typeof AccountDownloadRealmDialog
> = () => (
  <OnboardingDialogWrapper>
    <AccountDownloadRealmDialog
      patps={undefined}
      selectedPatp={undefined}
      setSelectedPatp={() => {}}
      onClickSidebarSection={() => {}}
      onDownloadMacM1={() => {}}
      onDownloadMacIntel={() => {}}
      onDownloadWindows={() => {}}
      onDownloadLinux={() => {}}
      onExit={() => {}}
    />
  </OnboardingDialogWrapper>
);

AccountDownloadRealmDialogStory.storyName = '2. Download Realm';
