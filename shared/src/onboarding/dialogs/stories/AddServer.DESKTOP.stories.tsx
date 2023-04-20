import { ComponentStory, ComponentMeta } from '@storybook/react';
import { Anchor } from '@holium/design-system/general';
import { OnboardDialogDescription } from '@holium/shared';
import { CreateAccountDialog } from '../CreateAccountDialog';
import { OnboardingDialogWrapper } from './helpers';
import { PassportDialog } from '../PassportDialog';
import { HostingDialog } from '../HostingDialog';
import { InstallationDialog } from '../InstallationDialog';
import { AddServerDialog } from '../AddServerDialog';
import { LoginDialog } from '../LoginDialog';

export default {
  component: CreateAccountDialog,
  title: 'Onboarding/Add Server DESKTOP',
} as ComponentMeta<typeof CreateAccountDialog>;

export const LoginDialogStory: ComponentStory<typeof LoginDialog> = () => (
  <OnboardingDialogWrapper>
    <LoginDialog
      showTerms
      label={
        <OnboardDialogDescription>
          Don't have access? <Anchor>Join waitlist</Anchor>.
        </OnboardDialogDescription>
      }
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

export const AddServerDialogStory: ComponentStory<
  typeof AddServerDialog
> = () => (
  <OnboardingDialogWrapper>
    <AddServerDialog onBack={() => {}} onNext={() => Promise.resolve(false)} />
  </OnboardingDialogWrapper>
);

AddServerDialogStory.storyName = '3. Add server';

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

PassportDialogStory.storyName = '4. Create your Passport';

// export const PasswordDialogStory: ComponentStory<
//   typeof PassportDialog
// > = () => (
//   <OnboardingDialogWrapper>
//     <PasswordDialog onBack={() => {}} onNext={() => Promise.resolve(false)} />
//   </OnboardingDialogWrapper>
// );

// PasswordDialogStory.storyName = '5. Password';

export const InstallationDialogStory: ComponentStory<
  typeof InstallationDialog
> = () => (
  <OnboardingDialogWrapper>
    <InstallationDialog
      onBack={() => {}}
      onInstallRealm={() => Promise.resolve(false)}
      onNext={() => Promise.resolve(false)}
    />
  </OnboardingDialogWrapper>
);

InstallationDialogStory.storyName = '5. Installation';
