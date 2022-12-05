import { EventEmitter } from 'events';
import TypedEmitter from 'typed-emitter';
import { action, makeObservable, observable } from 'mobx';
import { Patp } from '../types';
import { BaseProtocol } from './BaseProtocol';
import { BaseSigner } from 'wallets/BaseSigner';
import { Account } from './Account';
import { AccountType } from './types';

export class ProtocolWallet extends (EventEmitter as new () => TypedEmitter<ProtocolWalletEventCallback>) {
  accounts: Account[] = [];
  private signer: BaseSigner;
  private protocol: BaseProtocol;

  constructor(signer: BaseSigner, protocol: BaseProtocol) {
    super();
    this.signer = signer;
    this.protocol = protocol;
    this.protocol.onBlock('block', this.updateAccounts);

    makeObservable(this, {
      accounts: observable,
    });
  }

  private updateAccounts() {
    for (let account of this.accounts) {
      account.updateAccount();
    }
  }
  
  addAccount(account: AccountType) {
    this.accounts.push(new Account(account, this.signer, this.protocol));
  }
}

export type ProtocolWalletEventCallback = {
  ready: () => void;
  providerUpdated: (provider: Patp) => void;
  hostLeft: (host: Patp) => void;
};
