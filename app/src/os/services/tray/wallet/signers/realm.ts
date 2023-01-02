import { BaseSigner } from '../../wallet-lib/wallets/BaseSigner';
import { ethers } from 'ethers';
import { safeStorage } from 'electron';
import Realm from '../../../..';

export class RealmSigner implements BaseSigner {
  private core: Realm;
  constructor(core: Realm) {
    this.core = core;
  }
  setMnemonic(mnemonic: string) {
    const encryptedMnemonic = safeStorage
      .encryptString(mnemonic)
      .toString('base64');
    this.core.services.identity.auth.setMnemonic(
      'realm.auth.set-mnemonic',
      encryptedMnemonic
    );
  }
  signTransaction(path: string, transaction: any): any {
    const privateKey = this.getPrivateKey();
    const wallet = new ethers.Wallet(privateKey.derivePath(path).privateKey);
    return wallet.signTransaction(transaction);
  }
  private getPrivateKey() {
    const encryptedMnemonic =
      this.core.services.identity.auth.getMnemonic(null);
    const mnemonic = safeStorage.decryptString(
      Buffer.from(encryptedMnemonic, 'base64')
    );
    return ethers.utils.HDNode.fromMnemonic(mnemonic);
  }
  getXpub(path: string): string {
    return this.getPrivateKey().derivePath(path).neuter().extendedKey;
  }
}
