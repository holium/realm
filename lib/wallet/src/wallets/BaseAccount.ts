import { EventEmitter } from 'events';
import TypedEmitter from 'typed-emitter';
import { action, makeObservable, observable } from 'mobx';
import { Patp } from '../types';
import { BaseProtocol } from './BaseProtocol';

export abstract class BaseWallet extends (EventEmitter as new () => TypedEmitter<WalletEventCallbacks>) {
  protocol: BaseProtocol;
  assets: any[] = [];

  constructor(protocol: BaseProtocol) {
    super();
    this.protocol = protocol;

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
