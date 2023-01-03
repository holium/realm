import { Conduit } from "@holium/conduit";

/**
 * BaseProtocol is an abstract class that defines the interface for chain communication.
 */
export abstract class BaseProtocol {
  abstract updateWalletState(conduit: Conduit, walletState: any): void;
}
