import { ComponentMeta, ComponentStory } from '@storybook/react';

import { CreateAccountDialog } from '../onboarding';
import { OnboardingDialogWrapper } from './util';

export default {
  component: CreateAccountDialog,
  title: 'Onboarding/Purchase ID flow CRYPTO WEB',
} as ComponentMeta<typeof CreateAccountDialog>;

export const CreateAccountDialogStory: ComponentStory<
  typeof CreateAccountDialog
> = () => (
  <OnboardingDialogWrapper wallpaper={false}>
    <CreateAccountDialog
      onBack={() => {}}
      onNext={() => Promise.resolve(false)}
    />
  </OnboardingDialogWrapper>
);

CreateAccountDialogStory.storyName = '1. Create your account';
