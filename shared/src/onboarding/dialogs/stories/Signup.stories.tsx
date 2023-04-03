import { ComponentStory, ComponentMeta } from '@storybook/react';
import { BootingDialog } from '../BootingDialog';
import { ChooseIdDialog } from '../ChooseIdDialog';
import { CreateAccountDialog } from '../CreateAccountDialog';
import { CredentialsDialog } from '../CredentialsDialog';
import { DownloadDialog } from '../DownloadDialog';
import { PaymentDialog } from '../PaymentDialog';
import { VerifyEmailDialog } from '../VerifyEmailDialog';
import { OnboardingDialogWrapper } from './helpers';

export default {
  component: CreateAccountDialog,
  title: 'Onboarding/Signup flow',
} as ComponentMeta<typeof CreateAccountDialog>;

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
    <ChooseIdDialog
      patps={[
        '~zod',
        '~bus',
        '~wicdev-wisryt',
        '~nidsut-tomdun',
        '~fipfep-foslup',
        '~norsyr-tomdun',
        '~lopsyp-doztun',
        '~lomder-librun',
        '~littel-wolfur',
      ]}
      onSelectPatp={() => {}}
      onNext={() => Promise.resolve(false)}
    />
  </OnboardingDialogWrapper>
);

ChooseIdDialogStory.storyName = '3. Choose ID';

export const PaymentDialogStory: ComponentStory<typeof PaymentDialog> = () => (
  <OnboardingDialogWrapper>
    <PaymentDialog
      products={[
        {
          id: 1,
          title: 'Monthly',
          description: 'Monthly subscription',
          long_description: 'Monthly subscription',
          price_id: '11',
          subscription_price: 15,
        },
        {
          id: 2,
          title: 'Yearly',
          description: 'Yearly subscription',
          long_description: 'Yearly subscription',
          price_id: '12',
          subscription_price: 150,
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
      onBack={() => {}}
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

DownloadDialogStory.storyName = '7. Download';
