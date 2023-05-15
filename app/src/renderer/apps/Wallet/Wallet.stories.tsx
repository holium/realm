import { ComponentMeta, ComponentStory } from '@storybook/react';
import styled from 'styled-components';

import { Flex } from '@holium/design-system/general';

import { ProtocolType } from 'os/services/ship/wallet/wallet.types';

import { WalletFooterView } from './components/WalletFooter/WalletFooterView';
import { WalletHeaderView } from './components/WalletHeader/WalletHeaderView';
import { CreateScreen } from './screens/CreateScreen';

const TrayAppWrapper = styled(Flex)`
  flex-direction: column;
  width: 330px;
  height: 600px;
  padding: 12px;
  z-index: 16;
  position: absolute;
  overflow: hidden;
  transform: translate3d(0, 0, 0);
  backdrop-filter: blur(24px);
  backface-visibility: hidden;
  background: rgba(var(--rlm-window-bg-rgba));
  border: 1px solid rgba(var(--rlm-border-rgba));
  border-radius: 16px;
  box-shadow: 0px 0px 9px rgba(0, 0, 0, 0.12);
  ::-webkit-scrollbar {
    display: none;
  }
`;

const WalletWrapper = ({ children }: { children: React.ReactNode }) => (
  <Flex width="100%" height="100vh" justifyContent="center" alignItems="center">
    <TrayAppWrapper>{children}</TrayAppWrapper>
  </Flex>
);

export default {
  component: CreateScreen,
  title: 'Wallet/CreateScreen',
} as ComponentMeta<typeof CreateScreen>;

export const CreateStory: ComponentStory<typeof CreateScreen> = () => (
  <WalletWrapper>
    <WalletHeaderView
      showBack={false}
      isOnboarding={false}
      onClickBack={() => {}}
      onAddWallet={() => {}}
    />
    <CreateScreen setScreen={() => {}} />
    <WalletFooterView
      hidden={false}
      protocol={ProtocolType.BTC_MAIN}
      onClickSettings={() => {}}
    />
  </WalletWrapper>
);

CreateStory.storyName = '1. Create Wallet';
