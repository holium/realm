import { EventEmitter } from 'events';
import TypedEmitter from 'typed-emitter';
import { action, makeObservable, observable } from 'mobx';
import { Patp } from 'types';
import { BaseProtocol } from 'wallets';
import { NetworkType, ProtocolType } from './wallets/types';
import { WalletStoreType } from '../src/wallet.model';

export class Wallet extends (EventEmitter as new () => TypedEmitter<WalletEventCallback>) {
  wallets: Map<ProtocolType, BaseProtocol>;
  currentNetwork: NetworkType;
  currentProtocol: ProtocolType;
  lastInteraction: Date;

  constructor(wallets: Map<ProtocolType, BaseProtocol>, currentNetwork: NetworkType, currentProtocol: ProtocolType) {
    super();
    this.wallets = wallets;
    this.currentNetwork = currentNetwork;
    this.currentProtocol = currentProtocol;
    this.lastInteraction = new Date();

    makeObservable(this, {
      wallets: observable,
      currentNetwork: observable,
      currentProtocol: observable,
    });
  }

  setCurrentNetwork(currentNetwork: NetworkType) {
    this.currentNetwork = currentNetwork;
  }
  
  watchProtocol(currentProtocol: ProtocolType, walletState: WalletStoreType) {
    const lastProtocol: BaseProtocol = this.wallets.get(this.currentProtocol)!;
    lastProtocol.removeListener();
    this.currentProtocol = currentProtocol;
    const newProtocol: BaseProtocol = this.wallets.get(this.currentProtocol)!;
    newProtocol.onBlock(() => {
      this.wallets.get(this.currentProtocol)!.updateWalletState(walletState);
    })
  }
}

export type WalletEventCallback = {
  ready: () => void;
  providerUpdated: (provider: Patp) => void;
  hostLeft: (host: Patp) => void;
};
