import { ComponentMeta, ComponentStory } from '@storybook/react';

import {
  BootingDialog,
  ChooseIdentityDialog,
  CreateAccountDialog,
  CredentialsDialog,
  DownloadDialog,
  GetRealmDialog,
  PaymentDialog,
  SomethingWentWrongDialog,
  VerifyEmailDialog,
} from '../onboarding';
import { GetOnRealmDialog } from './GetOnRealm/GetOnRealmDialog';
import { UploadIdDialog } from './UploadId/UploadIdDialog';
import {
  mockPatps,
  OnboardingDialogWrapper,
  thirdEarthMockProduct,
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
    <GetRealmDialog
      onBack={() => {}}
      onPurchaseId={() => {}}
      onUploadId={() => {}}
    />
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

SomethingWentWrongDialogStory.storyName = '0.1. Something went wrong';

export const GetOnRealmDialogStory: ComponentStory<
  typeof GetOnRealmDialog
> = () => (
  <OnboardingDialogWrapper>
    <GetOnRealmDialog onPurchaseId={() => {}} onUploadId={() => {}} />
  </OnboardingDialogWrapper>
);

GetOnRealmDialogStory.storyName = '1. Get on Realm (Purchase or Upload)';

export const CreateAccountDialogStory: ComponentStory<
  typeof CreateAccountDialog
> = () => (
  <OnboardingDialogWrapper>
    <CreateAccountDialog
      onAlreadyHaveAccount={() => {}}
      onBack={() => {}}
      onNext={() => Promise.resolve(false)}
    />
  </OnboardingDialogWrapper>
);

CreateAccountDialogStory.storyName = '2. Create account';

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

VerifyEmailDialogStory.storyName = '3. Verify email';

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

ChooseIdDialogStory.storyName = '(Purchase) 4. Choose ID';

export const PaymentDialogStory: ComponentStory<typeof PaymentDialog> = () => (
  <OnboardingDialogWrapper>
    <PaymentDialog
      productType="planet"
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

PaymentDialogStory.storyName = '(Purchase) 5. Payment';

export const BootingDialogStory: ComponentStory<typeof BootingDialog> = () => (
  <OnboardingDialogWrapper>
    <BootingDialog
      isBooting
      logs={['Booting ~zod.', 'Grab some steak.']}
      onNext={() => Promise.resolve(false)}
    />
  </OnboardingDialogWrapper>
);

BootingDialogStory.storyName = '(Purchase) 6.1. Booting';

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

BootingDialogCompleteStory.storyName = '(Purchase) 6.2. Booting complete';

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

CredentialsDialogStory.storyName = '(Purchase) 7. Credentials';

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

DownloadDialogStory.storyName = '(Purchase) 8. Download Realm for desktop';

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

UploadIdPaymentDialogStory.storyName = '(Upload) 4. Payment';

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

UploadIdDialogStory.storyName = '(Upload) 5.1. Upload ID';

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

UploadIdUploadingDialogStory.storyName = '(Upload) 5.2. Upload ID – Uploading';

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

UploadIdDoneDialogStory.storyName = '(Upload) 5.3. Upload an ID – Uploaded';

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

BYOPBootingDialogStory.storyName = '(Upload) 6.1. Booting';

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

BYOPBootingDialogCompleteStory.storyName = '(Upload) 6.2. Booting complete';
