import { ComponentStory, ComponentMeta } from '@storybook/react';
import { AccountCustomDomainDialog } from '../AccountCustomDomainDialog';
import { AccountDownloadRealmDialog } from '../AccountDownloadRealmDialog';
import { AccountHostingDialog } from '../AccountHostingDialog';
import { AccountS3StorageDialog } from '../AccountS3StorageDialog';
import { AccountStatisticsDialog } from '../AccountStatisticsDialog';
import { LoginDialog } from '../LoginDialog';
import { OnboardingDialogWrapper } from './helpers';

export default {
  component: LoginDialog,
  title: 'Onboarding/Login flow',
} as ComponentMeta<typeof LoginDialog>;

export const LoginDialogStory: ComponentStory<typeof LoginDialog> = () => (
  <OnboardingDialogWrapper>
    <LoginDialog
      onNoAccount={() => {}}
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
      patps={['~pasren-satmex']}
      selectedPatp="~pasren-satmex"
      setSelectedPatp={() => {}}
      email="rubberducky12@protonmail.com"
      shipUrl="https://pasren-satmex.holium.network/"
      shipCode="tolnym-rilmug-ricnep-marlyx"
      shipMaintenanceWindow={7}
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

export const AccountS3StorageDialogStory: ComponentStory<
  typeof AccountS3StorageDialog
> = () => (
  <OnboardingDialogWrapper>
    <AccountS3StorageDialog
      patps={['~pasren-satmex']}
      selectedPatp="~pasren-satmex"
      setSelectedPatp={() => {}}
      url="https://console.s31.holium.network"
      s3Bucket="pasren-satmex"
      s3Password="1234567890"
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

AccountS3StorageDialogStory.storyName = '3. S3 Storage';

export const AccountStatisticsDialogStory: ComponentStory<
  typeof AccountStatisticsDialog
> = () => (
  <OnboardingDialogWrapper>
    <AccountStatisticsDialog
      patps={['~pasren-satmex']}
      selectedPatp="~pasren-satmex"
      setSelectedPatp={() => {}}
      onClickSidebarSection={() => {}}
      onExit={() => {}}
    />
  </OnboardingDialogWrapper>
);

AccountStatisticsDialogStory.storyName = '4. Statistics';

export const AccountCustomDomainDialogStory: ComponentStory<
  typeof AccountCustomDomainDialog
> = () => (
  <OnboardingDialogWrapper>
    <AccountCustomDomainDialog
      patps={['~pasren-satmex']}
      selectedPatp="~pasren-satmex"
      dropletIp="123.123.123.123"
      setSelectedPatp={() => {}}
      onClickSave={() => Promise.resolve()}
      onClickSidebarSection={() => {}}
      onExit={() => {}}
    />
  </OnboardingDialogWrapper>
);

AccountCustomDomainDialogStory.storyName = '5. Custom Domain';

export const AccountDownloadRealmDialogStory: ComponentStory<
  typeof AccountDownloadRealmDialog
> = () => (
  <OnboardingDialogWrapper>
    <AccountDownloadRealmDialog
      patps={['~pasren-satmex']}
      selectedPatp="~pasren-satmex"
      setSelectedPatp={() => {}}
      onClickSidebarSection={() => {}}
      onDownloadMacM1={() => {}}
      onDownloadMacIntel={() => {}}
      onDownloadWindows={() => {}}
      onDownloadLinux={() => {}}
      onExit={() => {}}
    />
  </OnboardingDialogWrapper>
);

AccountDownloadRealmDialogStory.storyName = '6. Download Realm';
