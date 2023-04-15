import { ComponentStory, ComponentMeta } from '@storybook/react';
import { CreateAccountDialog } from '../CreateAccountDialog';
import { OnboardingDialogWrapper } from './helpers';
import { ClaimTokenDialog } from '../ClaimTokenDialog';
import { AccountDownloadRealmDialog } from '../AccountDownloadRealmDialog';

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
