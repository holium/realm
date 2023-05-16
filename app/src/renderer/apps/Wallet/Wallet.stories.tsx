import { ReactNode } from 'react';
import { ComponentMeta, ComponentStory } from '@storybook/react';

import { Flex } from '@holium/design-system/general';
import { TrayAppWrapper } from '@holium/design-system/os';

import {
  NetworkType,
  ProtocolType,
} from 'os/services/ship/wallet/wallet.types';

import { WalletFooterView } from './components/WalletFooter/WalletFooterView';
import { WalletHeaderView } from './components/WalletHeader/WalletHeaderView';
import { BackupScreen } from './screens/BackupScreen';
import { ConfirmPasscodeScreen } from './screens/ConfirmPasscodeScreen';
import { ConfirmScreen } from './screens/ConfirmScreen';
import { CreatePasscodeScreen } from './screens/CreatePasscodeScreen';
import { CreateWalletScreenBody } from './screens/CreateWalletScreen/CreateWalletScreenBody';
import { FinalizingScreenBody } from './screens/FinalizingScreen/FinalizingScreenBody';
import { NoWalletFoundScreen } from './screens/NoWalletFoundScreen';
import { WalletListScreenBody } from './screens/WalletListScreen/WalletListScreenBody';

type WalletWrapperProps = {
  protocol?: ProtocolType;
  isOnboarding: boolean;
  hideBack?: boolean;
  children: ReactNode;
};

const WalletWrapper = ({
  protocol,
  isOnboarding,
  hideBack = false,
  children,
}: WalletWrapperProps) => (
  <Flex width="100%" height="100vh" justifyContent="center" alignItems="center">
    <TrayAppWrapper
      style={{
        width: 330,
        height: 600,
      }}
    >
      <WalletHeaderView
        showBack={!isOnboarding && !hideBack}
        isOnboarding={isOnboarding}
        onClickBack={() => {}}
        onAddWallet={() => {}}
      />
      {children}
      {protocol && !isOnboarding && (
        <WalletFooterView
          hidden={isOnboarding}
          protocol={protocol}
          onClickSettings={() => {}}
        />
      )}
    </TrayAppWrapper>
  </Flex>
);

export default {
  component: NoWalletFoundScreen,
  title: 'Wallet/Onboarding',
} as ComponentMeta<typeof NoWalletFoundScreen>;

export const CreateOrImportStory: ComponentStory<
  typeof NoWalletFoundScreen
> = () => (
  <WalletWrapper isOnboarding>
    <NoWalletFoundScreen setScreen={() => {}} />
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

export const ConfirmStory: ComponentStory<typeof ConfirmScreen> = () => (
  <WalletWrapper isOnboarding>
    <ConfirmScreen
      seedPhrase="route way orange glass jar wing social album tag raven august miracle"
      setScreen={() => {}}
    />
  </WalletWrapper>
);

ConfirmStory.storyName = '3. Confirm words';

export const CreatePasscodeStory: ComponentStory<
  typeof CreatePasscodeScreen
> = () => (
  <WalletWrapper isOnboarding>
    <CreatePasscodeScreen
      checkPasscode={() => Promise.resolve(false)}
      setPasscode={() => {}}
    />
  </WalletWrapper>
);

CreatePasscodeStory.storyName = '4. Set a passcode';

export const ConfirmPasscodeStory: ComponentStory<
  typeof ConfirmPasscodeScreen
> = () => (
  <WalletWrapper isOnboarding>
    <ConfirmPasscodeScreen
      correctPasscode={[1, 2, 3, 4, 5, 6]}
      checkPasscode={() => Promise.resolve(false)}
      onSuccess={() => {}}
      setScreen={() => {}}
    />
  </WalletWrapper>
);

ConfirmPasscodeStory.storyName = '5. Confirm passcode';

export const CreatingWalletStory: ComponentStory<
  typeof FinalizingScreenBody
> = () => (
  <WalletWrapper isOnboarding>
    <FinalizingScreenBody />
  </WalletWrapper>
);

CreatingWalletStory.storyName = '6. Creating wallet...';

export const NoAddressesStory: ComponentStory<
  typeof WalletListScreenBody
> = () => (
  <WalletWrapper
    protocol={ProtocolType.ETH_GORLI}
    isOnboarding={false}
    hideBack
  >
    <WalletListScreenBody
      wallets={[]}
      network={NetworkType.ETHEREUM}
      protocol={ProtocolType.ETH_GORLI}
      onSelectAddress={() => {}}
      onClickCreateAddress={() => {}}
    />
  </WalletWrapper>
);

NoAddressesStory.storyName = '7. No addresses';

export const CreateWalletStory: ComponentStory<
  typeof CreateWalletScreenBody
> = () => (
  <WalletWrapper protocol={ProtocolType.ETH_GORLI} isOnboarding={false}>
    <CreateWalletScreenBody
      network={NetworkType.ETHEREUM}
      loading={false}
      nickname="My wallet"
      onChangeNickname={() => {}}
      onClickCreate={() => {}}
    />
  </WalletWrapper>
);

CreateWalletStory.storyName = '8. Create address';

export const WalletList: ComponentStory<typeof WalletListScreenBody> = () => (
  <WalletWrapper
    protocol={ProtocolType.ETH_GORLI}
    isOnboarding={false}
    hideBack
  >
    <WalletListScreenBody
      wallets={[
        {
          index: 0,
          key: '1',
          network: NetworkType.ETHEREUM,
          path: "m/44'/60'/0'/0/0",
          address: '0x123456789',
          balance: '0.000000000000000000',
          nickname: 'My wallet',
          transactionList: {} as any,
          data: {
            get: () => ({
              balance: '0.000000000000000000',
              transactionList: {
                transactions: [],
              },
            }),
          } as any,
          setBalance: () => {},
          applyTransactions: () => {},
        },
      ]}
      network={NetworkType.ETHEREUM}
      protocol={ProtocolType.ETH_GORLI}
      onSelectAddress={() => {}}
      onClickCreateAddress={() => {}}
    />
  </WalletWrapper>
);

WalletList.storyName = '9. My addresses';
