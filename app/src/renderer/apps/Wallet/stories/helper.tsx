import { ReactNode } from 'react';

import { Flex } from '@holium/design-system/general';
import { TrayAppWrapper } from '@holium/design-system/os';

import { ProtocolType } from 'os/services/ship/wallet/wallet.types';

import { WalletFooterView } from '../components/WalletFooter/WalletFooterView';
import { WalletHeaderView } from '../components/WalletHeader/WalletHeaderView';

type WalletStoryWrapperProps = {
  protocol?: ProtocolType;
  isOnboarding?: boolean;
  hideHeader?: boolean;
  hideFooter?: boolean;
  hideBack?: boolean;
  children: ReactNode;
};

export const WalletStoryWrapper = ({
  protocol,
  isOnboarding = false,
  hideHeader = false,
  hideFooter = false,
  hideBack = false,
  children,
}: WalletStoryWrapperProps) => (
  <Flex width="100%" height="100vh" justifyContent="center" alignItems="center">
    <TrayAppWrapper
      style={{
        width: 330,
        height: 600,
      }}
    >
      {!hideHeader && (
        <WalletHeaderView
          showBack={!isOnboarding && !hideBack}
          isOnboarding={isOnboarding}
          onClickBack={() => {}}
          onAddWallet={() => {}}
        />
      )}
      {children}
      {protocol && !isOnboarding && !hideFooter && (
        <WalletFooterView protocol={protocol} onClickSettings={() => {}} />
      )}
    </TrayAppWrapper>
  </Flex>
);
