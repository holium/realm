import { EventEmitter } from 'events';
import TypedEmitter from 'typed-emitter';
// import { action, makeObservable, observable } from 'mobx';
import { makeAutoObservable } from 'mobx';
import { Patp } from '../types';
import { Account, Asset, ContractAddr } from './types';

/**
 * BaseAsset is an abstract class that defines the interface for chain communication.
 */
export abstract class BaseAsset extends (EventEmitter as new () => TypedEmitter<AssetEventCallbacks>) {
  our: Patp;
  accounts: any[] = [];

  constructor(our: Patp) {
    super();
    this.our = our;
    makeAutoObservable(this);
  }

  /**
   * Subscribes to protocol events and updates the state
   */
  abstract subscribe(): void;

  abstract unsubscribe(): void;

  /**
   * Get all accounts via this protocol
   * @returns {Promise<Account[]>}
   */
  abstract getAccounts(): Promise<Account[]> | Account[];

  abstract getAccountBalance(addr: string): number;

  abstract getAccountTransactions(addr: string): Promise<any[]>;

  abstract getAccountAssets(addr: string): Promise<Asset[]> | Asset[];
  /**
   * Sends a signed transaction to the network
   * @param signedTx
   */
  abstract sendTransaction(signedTx: string): Promise<any>;

  /**
   * Assets are tokens, coins, or multitoken contracts
   */

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
