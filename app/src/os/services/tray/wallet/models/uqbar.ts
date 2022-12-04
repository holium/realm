import {
  BaseProtocol,
  ProtocolEventCallbacks,
} from '@holium/realm-wallet/src/wallets/BaseProtocol';
import { Account, Asset } from '@holium/realm-wallet/src/wallets/types';
// @ts-expect-error
import abi from 'human-standard-token-abi';
// @ts-expect-error
import nftabi from 'non-fungible-token-abi';

export class UqbarProtocol implements BaseProtocol {
  accounts: Account[] = [];
  subscribe(): void {
    throw new Error('Method not implemented.');
  }
  unsubscribe(): void {
    throw new Error('Method not implemented.');
  }
  getAccounts(): Account[] | Promise<Account[]> {
    throw new Error('Method not implemented.');
  }
  getAccountBalance(addr: string): number | Promise<number> {
    throw new Error('Method not implemented.');
  }
  getAccountTransactions(addr: string): Promise<any[]> {
    throw new Error('Method not implemented.');
  }
  getAccountAssets(addr: string): Asset[] | Promise<Asset[]> {
    throw new Error('Method not implemented.');
  }
  sendTransaction(signedTx: string): Promise<any> {
    throw new Error('Method not implemented.');
  }
  getAsset(contract: string, addr: string): Asset {
    throw new Error('Method not implemented.');
  }
  getAssetBalance(contract: string, addr: string): number | Promise<number> {
    throw new Error('Method not implemented.');
  }
  getAssetMetadata(contract: string, addr: string): Asset | Promise<Asset> {
    throw new Error('Method not implemented.');
  }
  getAssetAllowance(contract: string, addr: string): number {
    throw new Error('Method not implemented.');
  }
  getAssetTransfers(contract: string, addr: string): Promise<any[]> {
    throw new Error('Method not implemented.');
  }
  transferAsset(
    contract: string,
    toAddr: string,
    amountOrTokenId: string | number
  ): void | Promise<void> {
    throw new Error('Method not implemented.');
  }
  getFeePrice(): number | Promise<number> {
    throw new Error('Method not implemented.');
  }
  getFeeEstimate(
    from: string,
    to: string,
    value: number
  ): number | Promise<number> {
    throw new Error('Method not implemented.');
  }
  addListener<E extends keyof ProtocolEventCallbacks>(
    event: E,
    listener: ProtocolEventCallbacks[E]
  ): this {
    throw new Error('Method not implemented.');
  }
  on<E extends keyof ProtocolEventCallbacks>(
    event: E,
    listener: ProtocolEventCallbacks[E]
  ): this {
    throw new Error('Method not implemented.');
  }
  once<E extends keyof ProtocolEventCallbacks>(
    event: E,
    listener: ProtocolEventCallbacks[E]
  ): this {
    throw new Error('Method not implemented.');
  }
  prependListener<E extends keyof ProtocolEventCallbacks>(
    event: E,
    listener: ProtocolEventCallbacks[E]
  ): this {
    throw new Error('Method not implemented.');
  }
  prependOnceListener<E extends keyof ProtocolEventCallbacks>(
    event: E,
    listener: ProtocolEventCallbacks[E]
  ): this {
    throw new Error('Method not implemented.');
  }
  off<E extends keyof ProtocolEventCallbacks>(
    event: E,
    listener: ProtocolEventCallbacks[E]
  ): this {
    throw new Error('Method not implemented.');
  }
  removeAllListeners<E extends keyof ProtocolEventCallbacks>(
    event?: E | undefined
  ): this {
    throw new Error('Method not implemented.');
  }
  removeListener<E extends keyof ProtocolEventCallbacks>(
    event: E,
    listener: ProtocolEventCallbacks[E]
  ): this {
    throw new Error('Method not implemented.');
  }
  emit<E extends keyof ProtocolEventCallbacks>(
    event: E,
    ...args: Parameters<ProtocolEventCallbacks[E]>
  ): boolean {
    throw new Error('Method not implemented.');
  }
  eventNames(): (string | symbol)[] {
    throw new Error('Method not implemented.');
  }
  rawListeners<E extends keyof ProtocolEventCallbacks>(
    event: E
  ): ProtocolEventCallbacks[E][] {
    throw new Error('Method not implemented.');
  }
  listeners<E extends keyof ProtocolEventCallbacks>(
    event: E
  ): ProtocolEventCallbacks[E][] {
    throw new Error('Method not implemented.');
  }
  listenerCount<E extends keyof ProtocolEventCallbacks>(event: E): number {
    throw new Error('Method not implemented.');
  }
  getMaxListeners(): number {
    throw new Error('Method not implemented.');
  }
  setMaxListeners(maxListeners: number): this {
    throw new Error('Method not implemented.');
  }
}
