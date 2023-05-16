import { ReactNode } from 'react';
import { ComponentMeta, ComponentStory } from '@storybook/react';

import { Flex } from '@holium/design-system/general';
import { TrayAppWrapper } from '@holium/design-system/os';

import { ProtocolType } from 'os/services/ship/wallet/wallet.types';

import { WalletFooterView } from './components/WalletFooter/WalletFooterView';
import { WalletHeaderView } from './components/WalletHeader/WalletHeaderView';
import { BackupScreen } from './screens/BackupScreen';
import { ConfirmScreen } from './screens/ConfirmScreen';
import { CreateOrImportScreen } from './screens/CreateOrImportScreen';

type WalletWrapperProps = {
  isOnboarding: boolean;
  children: ReactNode;
};

const WalletWrapper = ({ isOnboarding, children }: WalletWrapperProps) => (
  <Flex width="100%" height="100vh" justifyContent="center" alignItems="center">
    <TrayAppWrapper
      style={{
        width: 330,
        height: 600,
      }}
    >
      <WalletHeaderView
        showBack={false}
        isOnboarding={isOnboarding}
        onClickBack={() => {}}
        onAddWallet={() => {}}
      />
      {children}
      <WalletFooterView
        hidden={isOnboarding}
        protocol={ProtocolType.BTC_MAIN}
        onClickSettings={() => {}}
      />
    </TrayAppWrapper>
  </Flex>
);

export default {
  component: CreateOrImportScreen,
  title: 'Wallet/Create wallet flow',
} as ComponentMeta<typeof CreateOrImportScreen>;

export const CreateOrImportStory: ComponentStory<
  typeof CreateOrImportScreen
> = () => (
  <WalletWrapper isOnboarding>
    <CreateOrImportScreen setScreen={() => {}} />
  </WalletWrapper>
);

CreateOrImportStory.storyName = '1. No wallet found';

export const BackUpWalletStory: ComponentStory<typeof BackupScreen> = () => (
  <WalletWrapper isOnboarding>
    <BackupScreen
      seedPhrase="route way orange glass jar wing social album tag raven august miracle"
      setSeedPhrase={() => {}}
      setScreen={() => {}}
    />
  </WalletWrapper>
);

BackUpWalletStory.storyName = '2. Back up your wallet';

export const ConfirmStory: ComponentStory<typeof ConfirmScreen> = () => {
  return (
    <WalletWrapper isOnboarding>
      <ConfirmScreen
        seedPhrase="route way orange glass jar wing social album tag raven august miracle"
        setScreen={() => {}}
      />
    </WalletWrapper>
  );
};

ConfirmStory.storyName = '3. Confirm words';
