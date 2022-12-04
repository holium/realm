import { EventEmitter } from 'events';
import TypedEmitter from 'typed-emitter';
import { action, makeObservable, observable } from 'mobx';
import { Patp } from '../types';
import { BaseProtocol } from './BaseProtocol';
import { BaseSigner } from 'wallets/BaseSigner';

export abstract class BaseAddress extends (EventEmitter as new () => TypedEmitter<WalletEventCallbacks>) {
  protocol: BaseProtocol;
  assets: any[] = [];

  constructor(protocol: BaseProtocol, signer: BaseSigner) {
    super();
    this.protocol = protocol;

    makeObservable(this, {
      protocol: observable,
      getAssets: action.bound,
    });
  }

  abstract getAssets(): void;
}

export type WalletEventCallbacks = {
  ready: () => void;
  providerUpdated: (provider: Patp) => void;
  hostLeft: (host: Patp) => void;
};
