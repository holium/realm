// import { action, makeObservable, observable } from 'mobx';
import { Account, Asset, ContractAddr } from './types';

/**
 * BaseAsset is an abstract class that defines the interface for chain communication.
 */
export abstract class BaseAsset {
  asset: Asset;

  constructor(assetType: string) {
    this.assetType = assetType;
  }

  abstract getBalance();

  abstract getTokenId();

  /**
   * Gets asset data for a given address
   *
   * Equivalent to calling all of the following:
   * - getAssetBalance
   * - getAssetMetadata
   * - getAssetAllowance
   *
   * @param contract
   * @param addr
   */
  abstract getAsset(contract: ContractAddr, addr: string): Asset;

  abstract getAssetBalance(contract: ContractAddr, addr: string): number;

  abstract getAssetMetadata(
    contract: ContractAddr,
    addr: string
  ): Promise<Asset> | Asset;

  abstract getAssetAllowance(contract: ContractAddr, addr: string): number;

  /**
   * Gets to and from transfers for a given address
   *
   * @param contract
   * @param addr
   */
  abstract getAssetTransfers(
    contract: ContractAddr,
    addr: string
  ): Promise<any[]>;

  /**
   * Initiates a transfer of an asset from one address to another
   *
   * @param contract
   * @param toAddr
   * @param amountOrTokenId
   */
  abstract transferAsset(
    contract: ContractAddr,
    toAddr: string,
    amountOrTokenId: number | string
  ): void;

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

export type AssetEventCallbacks = {
  subscribed: () => void;
  unsubscribed: () => void;
  accounts: (accounts: Account[]) => void;
  transactionSent: (tx: any) => void;
  transactionReceived: (tx: any) => void;
  transactionCompleted: (tx: any) => void;
  transactionFailed: (tx: any, err: Error) => void;
  accountBalanceUpdated: (addr: string, balance: number) => void;
  assetTransferred: (
    contract: ContractAddr,
    addr: string,
    asset: Asset
  ) => void;
};
