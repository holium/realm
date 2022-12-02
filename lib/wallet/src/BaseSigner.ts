import { EventEmitter } from 'events';
import TypedEmitter from 'typed-emitter';
import { makeObservable, observable } from 'mobx';
import { Patp } from 'types';
import { BaseProtocol } from 'wallets/BaseProtocol';

export abstract class BaseSigner extends (EventEmitter as new () => TypedEmitter<WalletEventCallbacks>) {

  constructor(protocol: BaseProtocol) {
    super();
  }

  abstract signTransaction(): void;
}

export type WalletEventCallbacks = {
  ready: () => void;
  providerUpdated: (provider: Patp) => void;
  hostLeft: (host: Patp) => void;
};
