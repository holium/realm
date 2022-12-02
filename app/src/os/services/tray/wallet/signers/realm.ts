import {
  BaseSigner,
} from '@holium/realm-wallet/src/wallets/BaseSigner';
import { ethers } from 'ethers';
import Realm from '../../../..';

export class RealmSigner implements BaseSigner {
  private core: Realm;
  constructor(core: Realm, mnemonic: string) {
    this.core = core;
    this.core.services.identity.auth.setMnemonic(
      'realm.auth.set-mnemonic',
      mnemonic
    );
  }
  signTransaction(path: string, transaction: any): any {
    const privateKey = this.getPrivateKey();
    const wallet = new ethers.Wallet(privateKey.derivePath(path).privateKey);
    return wallet.signTransaction(transaction);
  }
  private getPrivateKey() {
    return ethers.utils.HDNode.fromMnemonic(
      this.core.services.identity.auth.getMnemonic(null)
    );
  }
  getXpub(path: string): string {
    return this.getPrivateKey().derivePath(path).neuter().extendedKey;  
  }
}
