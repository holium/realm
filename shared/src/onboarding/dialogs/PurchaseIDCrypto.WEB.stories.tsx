import { ComponentMeta, ComponentStory } from '@storybook/react';

import { CreateAccountDialog } from '../onboarding';
import { BootingNodeDialog } from './BootingNode/BootingNodeDialog';
import { CreateAccountWithWalletDialog } from './CreateAccountWithWallet/CreateAccountWithWalletDialog';
import { FundAccountDialog } from './FundAccount/FundAccountDialog';
import { SkippedPaymentDialog } from './SkippedPayment/SkippedPaymentDialog';
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

export const FundAccountDialogStory: ComponentStory<
  typeof CreateAccountDialog
> = () => (
  <OnboardingDialogWrapper wallpaper={false}>
    <FundAccountDialog onNext={() => Promise.resolve(false)} />
  </OnboardingDialogWrapper>
);

FundAccountDialogStory.storyName = '2.1 Fund your account';

export const SkippedPaymentDialogStory: ComponentStory<
  typeof CreateAccountDialog
> = () => (
  <OnboardingDialogWrapper wallpaper={false}>
    <SkippedPaymentDialog onNext={() => Promise.resolve(false)} />
  </OnboardingDialogWrapper>
);

SkippedPaymentDialogStory.storyName = '2.2 You skipped payment';

export const BootingNodeDialogStory: ComponentStory<
  typeof CreateAccountDialog
> = () => (
  <OnboardingDialogWrapper wallpaper={false}>
    <BootingNodeDialog onNext={() => Promise.resolve(false)} />
  </OnboardingDialogWrapper>
);

BootingNodeDialogStory.storyName = '3.1 Booting your node';

export const BootedDialogStory: ComponentStory<
  typeof CreateAccountDialog
> = () => (
  <OnboardingDialogWrapper wallpaper={false}>
    <BootingNodeDialog onNext={() => Promise.resolve(false)} />
  </OnboardingDialogWrapper>
);

BootedDialogStory.storyName = '3.2 Booted';
