import { EventEmitter } from 'events';
import TypedEmitter from 'typed-emitter';
import { action, makeObservable, observable } from 'mobx';
import { Patp } from 'types';
import { ProtocolWallet } from 'wallets/ProtocolWallet';
import { ProtocolType } from 'wallets/types';

export class Wallet extends (EventEmitter as new () => TypedEmitter<WalletEventCallback>) {
  wallets: Map<ProtocolType, ProtocolWallet>;

  constructor(wallets: Map<string, ProtocolWallet>) {
    super();
    this.wallets = wallets;

    makeObservable(this, {
      wallets: observable,
    });
  }

}

export type WalletEventCallback = {
  ready: () => void;
  providerUpdated: (provider: Patp) => void;
  hostLeft: (host: Patp) => void;
};
