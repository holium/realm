import { EventEmitter } from 'events';
import TypedEmitter from 'typed-emitter';
import { action, makeObservable, observable } from 'mobx';
import { Patp } from '../types';
import { BaseProtocol } from './BaseProtocol';
import { BaseSigner } from 'wallets/BaseSigner';
import { AccountType } from './types';

export class Account extends (EventEmitter as new () => TypedEmitter<AccountEventCallback>) {
  account: AccountType;
  assets: any[] = [];
  private signer: BaseSigner;
  private protocol: BaseProtocol;

  constructor(
    account: AccountType,
    signer: BaseSigner,
    protocol: BaseProtocol
  ) {
    super();
    this.account = account;
    this.signer = signer;
    this.protocol = protocol;

    makeObservable(this, {
      account: observable,
      assets: observable,
    });
  }

  updateAccount() {
    this.protocol
      .getAccountBalance(this.account.addr)
      .then((balance) => (this.account.balance = balance));
    this.protocol
      .getAccountTransactions(this.account.addr)
      .then((transactions) => {});
    this.protocol.getAccountAssets(this.account.addr).then((assets) => {});
    for (let asset of this.assets) {
      asset.updateAsset();
    }
  }

  sendTransaction(tx: any) {
    const signedTx = this.signer.signTransaction(this.account.path!, tx);
    return this.protocol.sendTransaction(signedTx);
  }
}

export type AccountEventCallback = {
  ready: () => void;
  providerUpdated: (provider: Patp) => void;
  hostLeft: (host: Patp) => void;
};
