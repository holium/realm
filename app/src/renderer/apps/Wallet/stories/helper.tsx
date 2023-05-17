import { ReactNode } from 'react';

import { Flex } from '@holium/design-system/general';
import { TrayAppWrapper } from '@holium/design-system/os';

import {
  NetworkType,
  ProtocolType,
} from 'os/services/ship/wallet/wallet.types';

import { WalletFooterView } from '../components/WalletFooter/WalletFooterView';
import { WalletHeaderView } from '../components/WalletHeader/WalletHeaderView';

export const mockWallets = [
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
];

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
        <WalletFooterView
          hidden={isOnboarding}
          protocol={protocol}
          onClickSettings={() => {}}
        />
      )}
    </TrayAppWrapper>
  </Flex>
);
