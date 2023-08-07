import { ComponentMeta, ComponentStory } from '@storybook/react';

import {
  CreateAccountDialog,
  GetRealmDialog,
  SomethingWentWrongDialog,
} from '../onboarding';
import { GetOnRealmDialog } from './GetOnRealm/GetOnRealmDialog';
import { OnboardingDialogWrapper } from './util';

export default {
  component: CreateAccountDialog,
  title: 'Onboarding/Join Waitlist flow WEB',
} as ComponentMeta<typeof CreateAccountDialog>;

export const GetRealmDialogStory: ComponentStory<
  typeof GetRealmDialog
> = () => (
  <OnboardingDialogWrapper>
    <GetRealmDialog
      onBack={() => {}}
      onPurchaseId={() => {}}
      onUploadId={() => {}}
    />
  </OnboardingDialogWrapper>
);

GetRealmDialogStory.storyName = '1. Join waitlist';

export const SomethingWentWrongDialogStory: ComponentStory<
  typeof SomethingWentWrongDialog
> = () => (
  <OnboardingDialogWrapper>
    <SomethingWentWrongDialog onBack={() => {}} />
  </OnboardingDialogWrapper>
);

SomethingWentWrongDialogStory.storyName = '1.1. Something went wrong';

export const GetOnRealmDialogStory: ComponentStory<
  typeof GetOnRealmDialog
> = () => (
  <OnboardingDialogWrapper>
    <GetOnRealmDialog
      onPurchaseId={() => {}}
      onUploadId={() => {}}
      onAlreadyHaveAccount={() => {}}
    />
  </OnboardingDialogWrapper>
);

GetOnRealmDialogStory.storyName = '2. Get on Realm (Purchase or Upload)';
