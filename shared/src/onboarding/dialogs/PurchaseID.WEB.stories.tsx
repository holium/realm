import { ComponentMeta, ComponentStory } from '@storybook/react';

import {
  BootingDialog,
  ChooseIdentityDialog,
  CreateAccountDialog,
  CredentialsDialog,
  GetOnRealmDialog,
  PaymentDialog,
  ThirdEarthPeriodicity,
  VerifyEmailDialog,
} from '../onboarding';
import {
  mockPatps,
  OnboardingDialogWrapper,
  thirdEarthMockPriceOptions,
} from './util';

export default {
  component: CreateAccountDialog,
  title: 'Onboarding/Purchase ID flow WEB',
} as ComponentMeta<typeof CreateAccountDialog>;

export const GetOnRealmDialogStory: ComponentStory<
  typeof GetOnRealmDialog
> = () => (
  <OnboardingDialogWrapper>
    <GetOnRealmDialog
      onPurchaseId={() => {}}
      onUploadPier={() => {}}
      onAlreadyHaveAccount={() => {}}
    />
  </OnboardingDialogWrapper>
);

GetOnRealmDialogStory.storyName = '0. Purchase or Upload';

export const CreateAccountDialogStory: ComponentStory<
  typeof CreateAccountDialog
> = () => (
  <OnboardingDialogWrapper>
    <CreateAccountDialog
      onBack={() => {}}
      onNext={() => Promise.resolve(false)}
    />
  </OnboardingDialogWrapper>
);

CreateAccountDialogStory.storyName = '1. Create account';

export const VerifyEmailDialogStory: ComponentStory<
  typeof VerifyEmailDialog
> = () => (
  <OnboardingDialogWrapper>
    <VerifyEmailDialog
      onResend={() => {}}
      onBack={() => {}}
      onNext={() => Promise.resolve(false)}
    />
  </OnboardingDialogWrapper>
);

VerifyEmailDialogStory.storyName = '2. Verify email';

export const ChooseIdDialogStory: ComponentStory<
  typeof ChooseIdentityDialog
> = () => (
  <OnboardingDialogWrapper>
    <ChooseIdentityDialog
      identities={mockPatps}
      onNext={() => Promise.resolve(false)}
    />
  </OnboardingDialogWrapper>
);

ChooseIdDialogStory.storyName = '3. Choose ID';

export const PaymentDialogStory: ComponentStory<typeof PaymentDialog> = () => (
  <OnboardingDialogWrapper>
    <PaymentDialog
      priceOptions={thirdEarthMockPriceOptions}
      periodicity={ThirdEarthPeriodicity.MONTH}
      setPeriodicity={() => {}}
      patp="~zod"
      email="admin@admin.com"
      stripe={undefined}
      stripeOptions={undefined}
      onBack={() => {}}
      onNext={() => Promise.resolve(false)}
    />
  </OnboardingDialogWrapper>
);

PaymentDialogStory.storyName = '4. Payment';

export const BootingDialogStory: ComponentStory<typeof BootingDialog> = () => (
  <OnboardingDialogWrapper>
    <BootingDialog
      isBooting
      logs={['Booting ~zod.', 'Go touch some grass.']}
      onNext={() => Promise.resolve(false)}
    />
  </OnboardingDialogWrapper>
);

BootingDialogStory.storyName = '5.1. Booting';

export const BootingDialogCompleteStory: ComponentStory<
  typeof BootingDialog
> = () => (
  <OnboardingDialogWrapper>
    <BootingDialog
      isBooting={false}
      logs={['Booting ~zod.', 'Go touch some grass.', 'Booting complete.']}
      onNext={() => Promise.resolve(false)}
    />
  </OnboardingDialogWrapper>
);

BootingDialogCompleteStory.storyName = '5.2. Booting complete';

export const CredentialsDialogStory: ComponentStory<
  typeof CredentialsDialog
> = () => (
  <OnboardingDialogWrapper>
    <CredentialsDialog
      credentials={{
        id: '~pasren-satmex',
        url: 'https://pasren-satmex.holium.network',
        accessCode: 'tolnym-rilmug-ricnep-marlyx',
      }}
      onNext={() => Promise.resolve(false)}
    />
  </OnboardingDialogWrapper>
);

CredentialsDialogStory.storyName = '6. Credentials';
