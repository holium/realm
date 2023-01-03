import { BaseProtocol } from './BaseProtocol';
import { Asset } from '../wallet.model';

/**
 * BaseProtocol is an abstract class that defines the interface for chain communication.
 */
export abstract class BaseBlockProtocol extends BaseProtocol {
  abstract watchUpdates(conduit: any, walletState: any): void;

  abstract updateWalletState(conduit: any, walletState: any, currentBlock?: number): void;

  abstract removeListener(): void;

  abstract getAccountBalance(addr: string): Promise<string>;

  abstract getAccountTransactions(
    addr: string,
    fromBlock?: number,
    toBlock?: number
  ): Promise<any[]>;

  abstract getAccountAssets(addr: string): Promise<Asset[]>;

  /**
   * Sends a signed transaction to the network
   * @param signedTx
   */
  abstract sendTransaction(signedTx: string): Promise<any>;

  /**
   * Assets are tokens, coins, or multitoken contracts
   */
  abstract getAsset(
    contract: string,
    addr: string,
    type?: string,
    tokenId?: string
  ): Promise<Asset | null>;

  /**
   * Gets to and from transfers for a given address
   *
   * @param contract
   * @param addr
   */
  abstract getAssetTransfers(
    contract: string,
    addr: string,
    fromBlock?: number,
    toBlock?: number
  ): Promise<any[]>;

  /**
   * Initiates a transfer of an asset from one address to another
   *
   * @param contract
   * @param toAddr
   * @param amountOrTokenId
   */
  abstract transferAsset(
    contract: string,
    toAddr: string,
    amountOrTokenId: number | string
  ): void | Promise<void>;

  /**
   * Fee / gas functions
   */
  abstract getFeePrice(): Promise<number> | number;
  abstract getFeeEstimate(
    from: string,
    to: string,
    value: string
  ): Promise<number> | number;
}
