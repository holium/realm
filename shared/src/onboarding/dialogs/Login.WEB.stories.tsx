import { ComponentMeta, ComponentStory } from '@storybook/react';

import { Anchor } from '@holium/design-system/general';

import {
  AccountCustomDomainDialog,
  AccountDownloadRealmDialog,
  AccountHostingDialog,
  AccountStorageDialog,
  ForgotPassword,
  LoginDialog,
  OnboardDialogDescription,
} from '../onboarding';
import { OnboardingDialogWrapper } from './util';

export default {
  component: LoginDialog,
  title: 'Onboarding/Login flow WEB',
} as ComponentMeta<typeof LoginDialog>;

export const LoginDialogStory: ComponentStory<typeof LoginDialog> = () => (
  <OnboardingDialogWrapper>
    <LoginDialog
      label={
        <OnboardDialogDescription>
          Don't have an account yet? <Anchor>Sign up</Anchor>.
        </OnboardDialogDescription>
      }
      footer={<ForgotPassword onClick={() => {}} />}
      onLogin={() => Promise.resolve(false)}
    />
  </OnboardingDialogWrapper>
);

LoginDialogStory.storyName = '1. Login';

export const AccountHostingDialogStory: ComponentStory<
  typeof AccountHostingDialog
> = () => (
  <OnboardingDialogWrapper>
    <AccountHostingDialog
      identities={['~pasren-satmex']}
      selectedIdentity="~pasren-satmex"
      setSelectedIdentity={() => {}}
      onClickPurchaseId={() => {}}
      onClickMigrateId={() => {}}
      email="rubberducky12@protonmail.com"
      serverUrl="https://pasren-satmex.holium.network/"
      serverCode="tolnym-rilmug-ricnep-marlyx"
      serverMaintenanceWindow={7}
      onClickChangeEmail={() => {}}
      onClickChangePassword={() => {}}
      onClickManageBilling={() => {}}
      onClickGetNewAccessCode={() => {}}
      onClickChangeMaintenanceWindow={() => {}}
      onClickEjectId={() => {}}
      onClickSidebarSection={() => {}}
      onExit={() => {}}
    />
  </OnboardingDialogWrapper>
);

AccountHostingDialogStory.storyName = '2. Hosting';

export const AccountStorageDialogStory: ComponentStory<
  typeof AccountStorageDialog
> = () => (
  <OnboardingDialogWrapper>
    <AccountStorageDialog
      identities={['~pasren-satmex']}
      selectedIdentity="~pasren-satmex"
      setSelectedIdentity={() => {}}
      onClickPurchaseId={() => {}}
      onClickMigrateId={() => {}}
      storageUrl="https://console.s31.holium.network"
      storageBucket="pasren-satmex"
      storagePassword="1234567890"
      dataStorage={{ used: 800, total: 2000 }}
      dataSent={{
        networkUsage: 20,
        minioUsage: 30,
      }}
      onClickSidebarSection={() => {}}
      onExit={() => {}}
    />
  </OnboardingDialogWrapper>
);

AccountStorageDialogStory.storyName = '3. Storage';

export const AccountCustomDomainDialogStory: ComponentStory<
  typeof AccountCustomDomainDialog
> = () => (
  <OnboardingDialogWrapper>
    <AccountCustomDomainDialog
      identities={['~pasren-satmex']}
      selectedIdentity="~pasren-satmex"
      dropletIp="123.123.123.123"
      domain="holium.network"
      submitting={false}
      onChangeDomain={() => {}}
      onSubmit={() => Promise.resolve()}
      setSelectedIdentity={() => {}}
      onClickPurchaseId={() => {}}
      onClickMigrateId={() => {}}
      onClickSidebarSection={() => {}}
      onExit={() => {}}
    />
  </OnboardingDialogWrapper>
);

AccountCustomDomainDialogStory.storyName = '4. Custom Domain';

export const AccountDownloadRealmDialogStory: ComponentStory<
  typeof AccountDownloadRealmDialog
> = () => (
  <OnboardingDialogWrapper>
    <AccountDownloadRealmDialog
      identities={['~pasren-satmex']}
      selectedIdentity="~pasren-satmex"
      setSelectedIdentity={() => {}}
      onClickPurchaseId={() => {}}
      onClickMigrateId={() => {}}
      onClickSidebarSection={() => {}}
      onDownloadMacM1={() => {}}
      onDownloadMacIntel={() => {}}
      onDownloadWindows={() => {}}
      onDownloadLinux={() => {}}
      onExit={() => {}}
    />
  </OnboardingDialogWrapper>
);

AccountDownloadRealmDialogStory.storyName = '5. Download Realm';
