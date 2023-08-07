import { ComponentMeta, ComponentStory } from '@storybook/react';

import {
  BootingDialog,
  CreateAccountDialog,
  PaymentDialog,
  uploadErrors,
  VerifyEmailDialog,
} from '../onboarding';
import { UploadIdDialog } from './UploadId/UploadIdDialog';
import { UploadIdDisclaimerDialog } from './UploadIdDisclaimer/UploadIdDisclaimerDialog';
import { OnboardingDialogWrapper, thirdEarthMockProduct } from './util';

export default {
  component: CreateAccountDialog,
  title: 'Onboarding/Upload ID flow WEB',
} as ComponentMeta<typeof CreateAccountDialog>;

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

export const UploadIdDisclaimerDialogStory: ComponentStory<
  typeof PaymentDialog
> = () => (
  <OnboardingDialogWrapper>
    <UploadIdDisclaimerDialog
      onBack={() => {}}
      onNext={() => Promise.resolve(false)}
    />
  </OnboardingDialogWrapper>
);

UploadIdDisclaimerDialogStory.storyName = '3. Disclaimer';

export const UploadIdPaymentDialogStory: ComponentStory<
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

UploadIdPaymentDialogStory.storyName = '4. Payment';

export const UploadIdDialogStory: ComponentStory<
  typeof UploadIdDialog
> = () => (
  <OnboardingDialogWrapper>
    <UploadIdDialog
      onUpload={() => Promise.resolve(false)}
      onBack={() => {}}
      onNext={() => Promise.resolve(false)}
    />
  </OnboardingDialogWrapper>
);

UploadIdDialogStory.storyName = '5.1. Upload ID';

export const UploadIdUploadingDialogStory: ComponentStory<
  typeof UploadIdDialog
> = () => (
  <OnboardingDialogWrapper>
    <UploadIdDialog
      fileName="sampel-palnet.tar.gz"
      progress={30}
      onUpload={() => Promise.resolve(false)}
      onBack={() => {}}
      onNext={() => Promise.resolve(false)}
    />
  </OnboardingDialogWrapper>
);

UploadIdUploadingDialogStory.storyName = '5.2. Upload ID – Uploading';

export const UploadIdStuckDialogStory: ComponentStory<
  typeof UploadIdDialog
> = () => (
  <OnboardingDialogWrapper>
    <UploadIdDialog
      fileName="sampel-palnet.tar.gz"
      progress={99}
      hint="Upload stuck? Try uploading in a different browser."
      onUpload={() => Promise.resolve(false)}
      onBack={() => {}}
      onNext={() => Promise.resolve(false)}
    />
  </OnboardingDialogWrapper>
);

UploadIdStuckDialogStory.storyName = '5.3. Upload ID – Stuck?';

export const UploadIdErrorDialogStory: ComponentStory<
  typeof UploadIdDialog
> = () => (
  <OnboardingDialogWrapper>
    <UploadIdDialog
      fileName="sampel-palnet.tar.gz"
      progress={27}
      error={uploadErrors['invalidFileError']}
      onUpload={() => Promise.resolve(false)}
      onBack={() => {}}
      onNext={() => Promise.resolve(false)}
    />
  </OnboardingDialogWrapper>
);

UploadIdErrorDialogStory.storyName = '5.4. Upload ID – Error';

export const UploadIdDoneDialogStory: ComponentStory<
  typeof UploadIdDialog
> = () => (
  <OnboardingDialogWrapper>
    <UploadIdDialog
      fileName="sampel-palnet.tar.gz"
      progress={100}
      onUpload={() => Promise.resolve(false)}
      onBack={() => {}}
      onNext={() => Promise.resolve(false)}
    />
  </OnboardingDialogWrapper>
);

UploadIdDoneDialogStory.storyName = '5.5. Upload an ID – Uploaded';

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
