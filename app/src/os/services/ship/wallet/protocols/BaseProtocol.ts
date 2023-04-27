import { Conduit } from 'os/services/api';

/**
 * BaseProtocol is an abstract class that defines the interface for chain communication.
 */
export abstract class BaseProtocol {
  abstract updateWalletState(conduit: Conduit, walletState: any): void;
}
