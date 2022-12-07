import { EventEmitter } from 'events';
import TypedEmitter from 'typed-emitter';
import { action, makeObservable, observable } from 'mobx';
import { Patp } from 'types';
import { BaseProtocol } from 'wallets';
import { NetworkType, ProtocolType } from './wallets/types';
import { WalletStoreType } from '../src/wallet.model';

export class Wallet {
  protocols: Map<ProtocolType, BaseProtocol>;
  currentProtocol: ProtocolType;

  constructor(protocols: Map<ProtocolType, BaseProtocol>, currentProtocol: ProtocolType) {
    this.protocols = protocols;
    this.currentProtocol = currentProtocol;
  }
  
  watchUpdates(currentProtocol: ProtocolType, walletState: WalletStoreType) {
    const lastProtocol: BaseProtocol = this.protocols.get(this.currentProtocol)!;
    lastProtocol.removeListener();
    this.currentProtocol = currentProtocol;
    this.protocols.get(this.currentProtocol)!.watchUpdates(walletState);
  }
}

export type WalletEventCallback = {
  ready: () => void;
  providerUpdated: (provider: Patp) => void;
  hostLeft: (host: Patp) => void;
};
