import { NetworkType } from 'os/services/ship/wallet/wallet.types';

import { WalletScreen } from '../types';
import { CreateWalletScreen } from './Base/CreateWalletScreen/CreateWalletScreen';
import { DetailScreen } from './Base/DetailScreen/DetailScreen';
import { ForgotPasscodeScreen } from './Base/ForgotPasscodeScreen/ForgotPasscodeScreen';
import { LockedScreen } from './Base/LockedScreen/LockedScreen';
import { NFTDetailScreen } from './Base/NFTDetailScreen/NFTDetailScreen';
import { TransactionDetailScreen } from './Base/TransactionDetailScreen/TransactionDetailScreen';
import { WalletListScreen } from './Base/WalletListScreen/WalletListScreen';
import { WalletSettingsScreen } from './Base/WalletSettingsScreen/WalletSettingsScreen';
import { WalletOnboarding } from './WalletOnboarding';

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
  [WalletScreen.CREATE_WALLET]: ({ network }: { network: NetworkType }) => (
    <CreateWalletScreen network={network} />
  ),
  [WalletScreen.LOCKED]: () => <LockedScreen />,
  [WalletScreen.SETTINGS]: () => <WalletSettingsScreen />,
  [WalletScreen.NFT_DETAIL]: () => <NFTDetailScreen />,
  [WalletScreen.FORGOT_PASSCODE]: () => <ForgotPasscodeScreen />,
};
