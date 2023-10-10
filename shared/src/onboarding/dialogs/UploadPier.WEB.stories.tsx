import { ComponentMeta, ComponentStory } from '@storybook/react';

import {
  BootingDialog,
  CreateAccountDialog,
  GetOnRealmDialog,
  PaymentDialog,
  ThirdEarthPeriodicity,
  VerifyEmailDialog,
} from '../onboarding';
import { UploadPierDialog } from './UploadPier/UploadPierDialog';
import { UploadPierDisclaimerDialog } from './UploadPierDisclaimer/UploadPierDisclaimerDialog';
import { OnboardingDialogWrapper, thirdEarthMockPriceOptions } from './util';

export default {
  component: CreateAccountDialog,
  title: 'Onboarding/Upload Pier flow WEB',
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

export const UploadPierDisclaimerDialogStory: ComponentStory<
  typeof PaymentDialog
> = () => (
  <OnboardingDialogWrapper>
    <UploadPierDisclaimerDialog
      onBack={() => {}}
      onNext={() => Promise.resolve(false)}
    />
  </OnboardingDialogWrapper>
);

UploadPierDisclaimerDialogStory.storyName = '3. Disclaimer';

export const UploadPierPaymentDialogStory: ComponentStory<
  typeof PaymentDialog
> = () => (
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

UploadPierPaymentDialogStory.storyName = '4. Payment';

export const UploadPierGeneratingDialogStory: ComponentStory<
  typeof UploadPierDialog
> = () => (
  <OnboardingDialogWrapper>
    <UploadPierDialog
      ipAddress={undefined}
      password={undefined}
      onBack={() => {}}
    />
  </OnboardingDialogWrapper>
);

UploadPierGeneratingDialogStory.storyName = '5.1. Upload Pier – Generating';

export const UploadPierDialogStory: ComponentStory<
  typeof UploadPierDialog
> = () => (
  <OnboardingDialogWrapper>
    <UploadPierDialog
      ipAddress="157.230.48.21"
      password="908732"
      onBack={() => {}}
    />
  </OnboardingDialogWrapper>
);

UploadPierDialogStory.storyName = '5.2. Upload Pier';

export const UploadPierUploadingDialogStory: ComponentStory<
  typeof UploadPierDialog
> = () => (
  <OnboardingDialogWrapper>
    <UploadPierDialog
      ipAddress="157.230.48.21"
      password="908732"
      onBack={() => {}}
    />
  </OnboardingDialogWrapper>
);

UploadPierUploadingDialogStory.storyName = '5.3. Upload Pier – Uploading';

export const UploadPierErrorDialogStory: ComponentStory<
  typeof UploadPierDialog
> = () => (
  <OnboardingDialogWrapper>
    <UploadPierDialog
      ipAddress="157.230.48.21"
      password="908732"
      error="No provisional ship found."
      onBack={() => {}}
    />
  </OnboardingDialogWrapper>
);

UploadPierErrorDialogStory.storyName = '5.4. Upload Pier – Error';

export const UploadPierDoneDialogStory: ComponentStory<
  typeof UploadPierDialog
> = () => (
  <OnboardingDialogWrapper>
    <UploadPierDialog
      ipAddress="157.230.48.21"
      password="908732"
      onBack={() => {}}
    />
  </OnboardingDialogWrapper>
);

UploadPierDoneDialogStory.storyName = '5.5. Upload Pier – Uploaded';

export const BYOPBootingDialogStory: ComponentStory<
  typeof BootingDialog
> = () => (
  <OnboardingDialogWrapper>
    <BootingDialog
      isBooting
      logs={['Booting ~zod.', 'Go touch some grass.']}
      onNext={() => Promise.resolve(false)}
    />
  </OnboardingDialogWrapper>
);

BYOPBootingDialogStory.storyName = '6.1. Booting';

export const BYOPBootingDialogCompleteStory: ComponentStory<
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

BYOPBootingDialogCompleteStory.storyName = '6.2. Booting complete';
