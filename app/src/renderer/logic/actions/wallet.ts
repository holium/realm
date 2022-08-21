import { WalletService } from 'os/services/tray/wallet.service';

/**
 * WalletActions for interfacing with core process
 */
type WalletActionType = typeof WalletService.preload;
export const WalletActions: WalletActionType = window.electron.os.tray.wallet