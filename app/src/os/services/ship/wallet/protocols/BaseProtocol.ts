import { WalletDB } from '../wallet.db';

/**
 * BaseProtocol is an abstract class that defines the interface for chain communication.
 */
export abstract class BaseProtocol {
  abstract updateWalletState(walletState: WalletDB): void;
}
