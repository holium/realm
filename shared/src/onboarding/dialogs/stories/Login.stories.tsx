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
      id="~pasren-satmex"
      email="rubberducky12@protonmail.com"
      payment="Credit Card"
      url="https://pasren-satmex.holium.network/"
      accessCode="tolnym-rilmug-ricnep-marlyx"
      maintenanceWindow="Sunday, 04:00 - 06:00 GMT"
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
      url="https://console.s31.holium.network"
      s3Bucket="pasren-satmex"
      s3Password="1234567890"
      dataStorage={{ used: 800, total: 2000 }}
      dataSent={{ shipUsed: 20.1, s3Used: 50, total: 200 }}
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
