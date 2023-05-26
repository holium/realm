import { ComponentMeta, ComponentStory } from '@storybook/react';

import { Anchor } from '@holium/design-system/general';
import { OnboardDialogDescription } from '@holium/shared';

import { TermsDisclaimer } from '../components/TermsDisclaimer';
import { AddIdentityDialog } from './AddIdentity/AddIdentityDialog';
import { CreateAccountDialog } from './CreateAccount/CreateAccountDialog';
import { HostingDialog } from './Hosting/HostingDialog';
import { InstallationDialog } from './Installation/InstallationDialog';
import { LoginDialog } from './Login/LoginDialog';
import { PassportDialog } from './Passport/PassportDialog';
import { OnboardingDialogWrapper } from './util';

export default {
  component: CreateAccountDialog,
  title: 'Onboarding/Add Identity DESKTOP',
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

export const AddIdentityDialogStory: ComponentStory<
  typeof AddIdentityDialog
> = () => (
  <OnboardingDialogWrapper>
    <AddIdentityDialog
      onBack={() => {}}
      onNext={() => Promise.resolve(false)}
    />
  </OnboardingDialogWrapper>
);

AddIdentityDialogStory.storyName = '3. Add identity';

export const InstallationDialogStory: ComponentStory<
  typeof InstallationDialog
> = () => (
  <OnboardingDialogWrapper>
    <InstallationDialog
      onInstallRealm={() =>
        Promise.resolve({
          success: true,
        })
      }
      onNext={() => Promise.resolve(false)}
    />
  </OnboardingDialogWrapper>
);

InstallationDialogStory.storyName = '4. Installation';

export const PassportDialogStory: ComponentStory<
  typeof PassportDialog
> = () => (
  <OnboardingDialogWrapper>
    <PassportDialog
      patp="~pasren-satmex"
      prefilledNickname=""
      prefilledDescription=""
      prefilledAvatarSrc=""
      prefilledColor="#333333"
      onUploadFile={() => Promise.reject()}
      onBack={() => {}}
      onNext={() => Promise.resolve(false)}
    />
  </OnboardingDialogWrapper>
);

PassportDialogStory.storyName = '5. Create your Passport';
