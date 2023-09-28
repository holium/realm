import { ComponentMeta, ComponentStory } from '@storybook/react';

import {
  BootingDialog,
  CreateAccountDialog,
  GetOnRealmDialog,
  PaymentDialog,
  VerifyEmailDialog,
} from '../onboarding';
import { UploadPierDialog } from './UploadPier/UploadPierDialog';
import { UploadPierDisclaimerDialog } from './UploadPierDisclaimer/UploadPierDisclaimerDialog';
import { OnboardingDialogWrapper, thirdEarthMockProduct } from './util';

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
      productType="byop-p"
      products={[
        {
          ...thirdEarthMockProduct,
          product_type: 'byop-p',
        },
      ]}
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

UploadPierPaymentDialogStory.storyName = '4. Payment';

export const UploadPierDialogStory: ComponentStory<
  typeof UploadPierDialog
> = () => (
  <OnboardingDialogWrapper>
    <UploadPierDialog
      ipAddress="157.230.48.21"
      password="908732"
      onBack={() => {}}
      onNext={() => Promise.resolve(false)}
    />
  </OnboardingDialogWrapper>
);

UploadPierDialogStory.storyName = '5.1. Upload Pier';

export const UploadPierUploadingDialogStory: ComponentStory<
  typeof UploadPierDialog
> = () => (
  <OnboardingDialogWrapper>
    <UploadPierDialog
      ipAddress="157.230.48.21"
      password="908732"
      onBack={() => {}}
      onNext={() => Promise.resolve(false)}
    />
  </OnboardingDialogWrapper>
);

UploadPierUploadingDialogStory.storyName = '5.2. Upload Pier – Uploading';

export const UploadPierErrorDialogStory: ComponentStory<
  typeof UploadPierDialog
> = () => (
  <OnboardingDialogWrapper>
    <UploadPierDialog
      ipAddress="157.230.48.21"
      password="908732"
      error="Pier already exists."
      onBack={() => {}}
      onNext={() => Promise.resolve(false)}
    />
  </OnboardingDialogWrapper>
);

UploadPierErrorDialogStory.storyName = '5.3. Upload Pier – Error';

export const UploadPierDoneDialogStory: ComponentStory<
  typeof UploadPierDialog
> = () => (
  <OnboardingDialogWrapper>
    <UploadPierDialog
      ipAddress="157.230.48.21"
      password="908732"
      onBack={() => {}}
      onNext={() => Promise.resolve(false)}
    />
  </OnboardingDialogWrapper>
);

UploadPierDoneDialogStory.storyName = '5.4. Upload Pier – Uploaded';

export const BYOPBootingDialogStory: ComponentStory<
  typeof BootingDialog
> = () => (
  <OnboardingDialogWrapper>
    <BootingDialog
      isBooting
      logs={['Booting ~zod.', 'Grab some steak.']}
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
      logs={['Booting ~zod.', 'Grab some steak.', 'Booting complete.']}
      onNext={() => Promise.resolve(false)}
    />
  </OnboardingDialogWrapper>
);

BYOPBootingDialogCompleteStory.storyName = '6.2. Booting complete';
