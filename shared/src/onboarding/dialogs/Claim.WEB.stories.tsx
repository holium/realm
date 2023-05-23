import { ComponentMeta, ComponentStory } from '@storybook/react';

import {
  AccountGetRealmDialog,
  ClaimTokenDialog,
  CreateAccountDialog,
} from '../onboarding';
import { OnboardingDialogWrapper } from './util';

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
      onClickBuyServer={() => {}}
      onClickGetHosting={() => {}}
      onClickSidebarSection={() => {}}
      onExit={() => {}}
    />
  </OnboardingDialogWrapper>
);

AccountGetRealmDialogStory.storyName = '2. Get Realm';
