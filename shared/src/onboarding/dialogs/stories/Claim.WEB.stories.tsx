import { ComponentMeta, ComponentStory } from '@storybook/react';

import { AccountGetRealmDialog } from '../AccountGetRealmDialog';
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
      onClaim={() => Promise.resolve(false)}
    />
  </OnboardingDialogWrapper>
);

CreateAccountDialogStory.storyName = '1. Claim token';

export const AccountGetRealmDialogStory: ComponentStory<
  typeof AccountGetRealmDialog
> = () => (
  <OnboardingDialogWrapper>
    <AccountGetRealmDialog
      onClickJoinWaitlist={() => Promise.resolve(false)}
      onClickBuyIdentity={() => {}}
      onClickGetHosting={() => {}}
      onClickSidebarSection={() => {}}
      onExit={() => {}}
    />
  </OnboardingDialogWrapper>
);

AccountGetRealmDialogStory.storyName = '2. Get Realm';
