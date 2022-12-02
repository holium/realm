import { EventEmitter } from 'events';
import TypedEmitter from 'typed-emitter';
import { action, makeObservable, observable } from 'mobx';
import { Patp } from '../types';
import { BaseProtocol } from './BaseProtocol';
import { BaseSigner } from 'wallets/BaseSigner';

export abstract class BaseAccount extends (EventEmitter as new () => TypedEmitter<WalletEventCallbacks>) {
  protocol: BaseProtocol;
  assets: any[] = [];
  signer: BaseSigner;

  constructor(protocol: BaseProtocol, signer: BaseSigner) {
    super();
    this.protocol = protocol;
    this.signer = signer;

    makeObservable(this, {
      protocol: observable,
      getWallets: action.bound,
    });
  }

  abstract getWallets(): void;
}

export type WalletEventCallbacks = {
  ready: () => void;
  providerUpdated: (provider: Patp) => void;
  hostLeft: (host: Patp) => void;
};
