import { NetworkType } from 'os/services/ship/wallet/wallet.types';

import { WalletScreen } from '../types';
import { CreateWalletScreen } from './CreateWalletScreen/CreateWalletScreen';
import { DetailScreen } from './DetailScreen/DetailScreen';
import { LockedScreen } from './LockedScreen/LockedScreen';
import { NFTDetailScreen } from './NFTDetailScreen';
import { TransactionDetailScreen } from './TransactionDetailScreen/TransactionDetailScreen';
import { WalletListScreen } from './WalletListScreen/WalletListScreen';
import { WalletOnboarding } from './WalletOnboarding';
import { WalletSettingsScreen } from './WalletSettingsScreen/WalletSettingsScreen';

export const walletScreens: Record<
  WalletScreen,
  (props: { network: NetworkType }) => JSX.Element
> = {
  [WalletScreen.LIST]: () => <WalletListScreen />,
  [WalletScreen.WALLET_DETAIL]: () => <DetailScreen />,
  [WalletScreen.TRANSACTION_SEND]: () => <DetailScreen />,
  [WalletScreen.TRANSACTION_DETAIL]: () => <TransactionDetailScreen />,
  [WalletScreen.ONBOARDING]: () => <WalletOnboarding />,
  [WalletScreen.TRANSACTION_CONFIRM]: () => <div />,
  [WalletScreen.CREATE_WALLET]: ({ network }) => (
    <CreateWalletScreen network={network} />
  ),
  [WalletScreen.LOCKED]: () => <LockedScreen />,
  [WalletScreen.SETTINGS]: () => <WalletSettingsScreen />,
  [WalletScreen.NFT_DETAIL]: () => <NFTDetailScreen />,
};
