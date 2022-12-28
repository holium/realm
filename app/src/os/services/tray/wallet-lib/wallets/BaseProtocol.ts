import { Conduit } from "@holium/conduit";

/**
 * BaseProtocol is an abstract class that defines the interface for chain communication.
 */
export abstract class BaseProtocol {
  abstract watchUpdates(conduit: Conduit, walletState: any): void;
  abstract sendTransaction(signedTx: string): Promise<any>;
}
