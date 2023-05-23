import { ComponentMeta, ComponentStory } from '@storybook/react';

import {
  BootingDialog,
  ChooseIdDialog,
  CreateAccountDialog,
  CredentialsDialog,
  DownloadDialog,
  GetRealmDialog,
  PaymentDialog,
  SomethingWentWrongDialog,
  VerifyEmailDialog,
} from '../onboarding';
import {
  mockPatps,
  OnboardingDialogWrapper,
  thirdEarthMockProducts,
} from './util';

export default {
  component: CreateAccountDialog,
  title: 'Onboarding/Signup flow WEB',
} as ComponentMeta<typeof CreateAccountDialog>;

export const GetRealmDialogStory: ComponentStory<
  typeof GetRealmDialog
> = () => (
  <OnboardingDialogWrapper>
    <GetRealmDialog onGetANewId={() => {}} onBack={() => {}} />
  </OnboardingDialogWrapper>
);

GetRealmDialogStory.storyName = '0. Join waitlist';

export const SomethingWentWrongDialogStory: ComponentStory<
  typeof SomethingWentWrongDialog
> = () => (
  <OnboardingDialogWrapper>
    <SomethingWentWrongDialog onBack={() => {}} />
  </OnboardingDialogWrapper>
);

SomethingWentWrongDialogStory.storyName = '0.1 Something went wrong';

export const CreateAccountDialogStory: ComponentStory<
  typeof CreateAccountDialog
> = () => (
  <OnboardingDialogWrapper>
    <CreateAccountDialog
      onAlreadyHaveAccount={() => {}}
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
  typeof ChooseIdDialog
> = () => (
  <OnboardingDialogWrapper>
    <ChooseIdDialog ids={mockPatps} onNext={() => Promise.resolve(false)} />
  </OnboardingDialogWrapper>
);

ChooseIdDialogStory.storyName = '3. Choose ID';

export const PaymentDialogStory: ComponentStory<typeof PaymentDialog> = () => (
  <OnboardingDialogWrapper>
    <PaymentDialog
      products={thirdEarthMockProducts}
      productId={1}
      setProductId={() => {}}
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
      logs={['Booting ~zod.', 'Grab some steak.']}
      onNext={() => Promise.resolve(false)}
    />
  </OnboardingDialogWrapper>
);

BootingDialogStory.storyName = '5.1 Booting';

export const BootingDialogCompleteStory: ComponentStory<
  typeof BootingDialog
> = () => (
  <OnboardingDialogWrapper>
    <BootingDialog
      isBooting={false}
      logs={['Booting ~zod.', 'Grab some steak.', 'Booting complete.']}
      onNext={() => Promise.resolve(false)}
    />
  </OnboardingDialogWrapper>
);

BootingDialogCompleteStory.storyName = '5.2 Booting complete';

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

export const DownloadDialogStory: ComponentStory<
  typeof DownloadDialog
> = () => (
  <OnboardingDialogWrapper>
    <DownloadDialog
      onDownloadMacM1={() => {}}
      onDownloadMacIntel={() => {}}
      onDownloadWindows={() => {}}
      onDownloadLinux={() => {}}
      onBack={() => {}}
      onNext={() => Promise.resolve(false)}
    />
  </OnboardingDialogWrapper>
);

DownloadDialogStory.storyName = '7. Download Realm for Desktop';
