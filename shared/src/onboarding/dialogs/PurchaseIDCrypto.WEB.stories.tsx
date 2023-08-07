import { ComponentMeta, ComponentStory } from '@storybook/react';

import { CreateAccountDialog } from '../onboarding';
import { CreateAccountWithWalletDialog } from './CreateAccountWithWallet/CreateAccountWithWalletDialog';
import { OnboardingDialogWrapper } from './util';

export default {
  component: CreateAccountDialog,
  title: 'Onboarding/Purchase ID w CRYPTO flow WEB',
} as ComponentMeta<typeof CreateAccountDialog>;

export const CreateAccountDialogStory: ComponentStory<
  typeof CreateAccountDialog
> = () => (
  <OnboardingDialogWrapper wallpaper={false}>
    <CreateAccountWithWalletDialog onNext={() => Promise.resolve(false)} />
  </OnboardingDialogWrapper>
);

CreateAccountDialogStory.storyName = '1. Create your account';
