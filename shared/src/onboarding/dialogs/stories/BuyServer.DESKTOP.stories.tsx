import { ComponentMeta, ComponentStory } from '@storybook/react';

import { Anchor } from '@holium/design-system/general';
import {
  BootingDialog,
  ChooseIdDialog,
  CredentialsDialog,
  OnboardDialogDescription,
  PaymentDialog,
} from '@holium/shared';

import { TermsDisclaimer } from '../../components/TermsDisclaimer';
import { CreateAccountDialog } from '../CreateAccountDialog';
import { HostingDialog } from '../HostingDialog';
import { LoginDialog } from '../LoginDialog';
import { PassportDialog } from '../PassportDialog';
import {
  mockPatps,
  OnboardingDialogWrapper,
  thirdEarthMockProducts,
} from './helpers';

export default {
  component: CreateAccountDialog,
  title: 'Onboarding/Buy Server DESKTOP',
} as ComponentMeta<typeof CreateAccountDialog>;

export const LoginDialogStory: ComponentStory<typeof LoginDialog> = () => (
  <OnboardingDialogWrapper>
    <LoginDialog
      label={
        <OnboardDialogDescription>
          Don't have access? <Anchor>Join waitlist</Anchor>.
        </OnboardDialogDescription>
      }
      footer={<TermsDisclaimer onClick={() => {}} />}
      onLogin={() => Promise.resolve(false)}
    />
  </OnboardingDialogWrapper>
);

LoginDialogStory.storyName = '1. Login';

export const HostingDialogStory: ComponentStory<typeof HostingDialog> = () => (
  <OnboardingDialogWrapper>
    <HostingDialog
      onBack={() => {}}
      onGetHosting={() => {}}
      onAddExistingServer={() => {}}
    />
  </OnboardingDialogWrapper>
);

HostingDialogStory.storyName = '2. Hosting';

export const ChooseIdDialogStory: ComponentStory<
  typeof ChooseIdDialog
> = () => (
  <OnboardingDialogWrapper>
    <ChooseIdDialog
      patps={mockPatps}
      onSelectPatp={() => {}}
      onNext={() => Promise.resolve(false)}
    />
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

export const PassportDialogStory: ComponentStory<
  typeof PassportDialog
> = () => (
  <OnboardingDialogWrapper>
    <PassportDialog
      patp="~pasren-satmex"
      prefilledNickname=""
      prefilledDescription=""
      prefilledAvatarSrc=""
      onUploadFile={() => Promise.reject()}
      onBack={() => {}}
      onNext={() => Promise.resolve(false)}
    />
  </OnboardingDialogWrapper>
);

PassportDialogStory.storyName = '7. Create your Passport';
