import { ComponentMeta, ComponentStory } from '@storybook/react';

import { Anchor } from '@holium/design-system/general';

import {
  AccountCustomDomainDialog,
  AccountHostingDialog,
  AccountStorageDialog,
  AccountUnfinishedUploadDialog,
  ForgotPassword,
  LoginDialog,
  OnboardDialogDescription,
} from '../onboarding';
import { OnboardingDialogWrapper, thirdEarthMockShip } from './util';

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
      ships={[thirdEarthMockShip]}
      selectedShipId={0}
      setSelectedShipId={() => {}}
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

AccountHostingDialogStory.storyName = '2 Hosting';

export const AccountStorageDialogStory: ComponentStory<
  typeof AccountStorageDialog
> = () => (
  <OnboardingDialogWrapper>
    <AccountStorageDialog
      ships={[thirdEarthMockShip]}
      selectedShipId={0}
      onClickRestartStorage={() => Promise.resolve()}
      setSelectedShipId={() => {}}
      storageUrl="https://console.s31.holium.network"
      storageBucket="pasren-satmex"
      storagePassword="1234567890"
      dataStorage={{ used: 800, total: 2000 }}
      dataSent={{
        networkUsage: 20,
        minioUsage: 30,
      }}
      isLoading={false}
      error={undefined}
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
      ships={[thirdEarthMockShip]}
      selectedShipId={0}
      setSelectedShipId={() => {}}
      dropletIp="123.123.123.123"
      domain="holium.network"
      submitting={false}
      onChangeDomain={() => {}}
      onSubmit={() => Promise.resolve()}
      onClickSidebarSection={() => {}}
      onExit={() => {}}
    />
  </OnboardingDialogWrapper>
);

AccountCustomDomainDialogStory.storyName = '4. Custom Domain';

export const AccountContinueWorkflowDialogStory: ComponentStory<
  typeof AccountStorageDialog
> = () => (
  <OnboardingDialogWrapper>
    <AccountUnfinishedUploadDialog
      ships={[
        {
          ...thirdEarthMockShip,
          ship_type: 'host',
        },
      ]}
      selectedShipId={0}
      setSelectedShipId={() => {}}
      onClickReuploadPier={() => {}}
      onClickSidebarSection={() => {}}
      onClickExit={() => {}}
    />
  </OnboardingDialogWrapper>
);

AccountContinueWorkflowDialogStory.storyName = '5.1. Continue Workflow';

export const AccountUnfinishedUploadDialogStory: ComponentStory<
  typeof AccountStorageDialog
> = () => (
  <OnboardingDialogWrapper>
    <AccountUnfinishedUploadDialog
      ships={[thirdEarthMockShip]}
      selectedShipId={0}
      setSelectedShipId={() => {}}
      onClickReuploadPier={() => {}}
      onClickSidebarSection={() => {}}
      onClickExit={() => {}}
    />
  </OnboardingDialogWrapper>
);

AccountUnfinishedUploadDialogStory.storyName = '5.2. Identity Being Created';

export const AccountErroredUploadDialogStory: ComponentStory<
  typeof AccountStorageDialog
> = () => (
  <OnboardingDialogWrapper>
    <AccountUnfinishedUploadDialog
      ships={[
        {
          ...thirdEarthMockShip,
          ship_type: 'hardError',
        },
      ]}
      selectedShipId={0}
      setSelectedShipId={() => {}}
      onClickReuploadPier={() => {}}
      onClickSidebarSection={() => {}}
      onClickExit={() => {}}
    />
  </OnboardingDialogWrapper>
);

AccountErroredUploadDialogStory.storyName = '5.3. Identity Upload Error';
