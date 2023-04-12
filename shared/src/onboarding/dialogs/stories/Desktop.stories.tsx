import { ComponentStory, ComponentMeta } from '@storybook/react';
import { CreateAccountDialog } from '../CreateAccountDialog';
import { OnboardingDialogWrapper } from './helpers';
import { PassportDialog } from '../PassportDialog';
import { HostingDialog } from '../HostingDialog';

export default {
  component: CreateAccountDialog,
  title: 'Onboarding/Desktop dialogs',
} as ComponentMeta<typeof CreateAccountDialog>;

export const HostingDialogStory: ComponentStory<typeof HostingDialog> = () => (
  <OnboardingDialogWrapper>
    <HostingDialog
      onBack={() => {}}
      onGetHosting={() => {}}
      onAddExistingUrbit={() => {}}
    />
  </OnboardingDialogWrapper>
);

HostingDialogStory.storyName = 'Hosting';

export const PassportDialogStory: ComponentStory<
  typeof PassportDialog
> = () => (
  <OnboardingDialogWrapper>
    <PassportDialog
      patp="~pasren-satmex"
      onBack={() => {}}
      onNext={() => Promise.resolve(false)}
    />
  </OnboardingDialogWrapper>
);

PassportDialogStory.storyName = 'Create your Passport';
