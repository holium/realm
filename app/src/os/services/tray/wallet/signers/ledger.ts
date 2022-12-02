import {
  BaseSigner,
  WalletEventCallbacks,
} from '@holium/realm-wallet/src/wallets/BaseSigner';

export class LedgerSigner implements BaseSigner {
  signTransaction(transaction: any): any {

  }
  getXpub(transaction: any)
  addListener<E extends keyof WalletEventCallbacks>(
    event: E,
    listener: WalletEventCallbacks[E]
  ): this {
    throw new Error('Method not implemented.');
  }
  on<E extends keyof WalletEventCallbacks>(
    event: E,
    listener: WalletEventCallbacks[E]
  ): this {
    throw new Error('Method not implemented.');
  }
  once<E extends keyof WalletEventCallbacks>(
    event: E,
    listener: WalletEventCallbacks[E]
  ): this {
    throw new Error('Method not implemented.');
  }
  prependListener<E extends keyof WalletEventCallbacks>(
    event: E,
    listener: WalletEventCallbacks[E]
  ): this {
    throw new Error('Method not implemented.');
  }
  prependOnceListener<E extends keyof WalletEventCallbacks>(
    event: E,
    listener: WalletEventCallbacks[E]
  ): this {
    throw new Error('Method not implemented.');
  }
  off<E extends keyof WalletEventCallbacks>(
    event: E,
    listener: WalletEventCallbacks[E]
  ): this {
    throw new Error('Method not implemented.');
  }
  removeAllListeners<E extends keyof WalletEventCallbacks>(
    event?: E | undefined
  ): this {
    throw new Error('Method not implemented.');
  }
  removeListener<E extends keyof WalletEventCallbacks>(
    event: E,
    listener: WalletEventCallbacks[E]
  ): this {
    throw new Error('Method not implemented.');
  }
  emit<E extends keyof WalletEventCallbacks>(
    event: E,
    ...args: Parameters<WalletEventCallbacks[E]>
  ): boolean {
    throw new Error('Method not implemented.');
  }
  eventNames(): (string | symbol)[] {
    throw new Error('Method not implemented.');
  }
  rawListeners<E extends keyof WalletEventCallbacks>(
    event: E
  ): WalletEventCallbacks[E][] {
    throw new Error('Method not implemented.');
  }
  listeners<E extends keyof WalletEventCallbacks>(
    event: E
  ): WalletEventCallbacks[E][] {
    throw new Error('Method not implemented.');
  }
  listenerCount<E extends keyof WalletEventCallbacks>(event: E): number {
    throw new Error('Method not implemented.');
  }
  getMaxListeners(): number {
    throw new Error('Method not implemented.');
  }
  setMaxListeners(maxListeners: number): this {
    throw new Error('Method not implemented.');
  }
}
