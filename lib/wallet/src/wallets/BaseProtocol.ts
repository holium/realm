import { WalletStoreType, Asset } from '../wallet.model';

/**
 * BaseProtocol is an abstract class that defines the interface for chain communication.
 */
export abstract class BaseProtocol {

  abstract watchUpdates(walletState: WalletStoreType): void;
  
  abstract removeListener(): void;

  abstract getAccountBalance(addr: string): Promise<string>;

  abstract getAccountTransactions(addr: string, startBlock?: number): Promise<any[]>;

  abstract getAccountAssets(addr: string): Promise<Asset[] | undefined>;

  /**
   * Sends a signed transaction to the network
   * @param signedTx
   */
  abstract sendTransaction(signedTx: string): Promise<any>;

  /**
   * Assets are tokens, coins, or multitoken contracts
   */
  abstract getAssetBalance(contract: string, addr: string): Promise<number>;

  abstract getAssetMetadata(
    contract: string,
    addr: string
  ): Promise<Asset>;

  abstract getAssetAllowance(contract: string, addr: string): Promise<number>;

  /**
   * Gets to and from transfers for a given address
   *
   * @param contract
   * @param addr
   */
  abstract getAssetTransfers(
    contract: string,
    addr: string,
    startBlock?: number
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
    value: number
  ): Promise<number> | number;
}
