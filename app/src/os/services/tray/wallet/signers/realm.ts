import { BaseSigner } from '../../wallet-lib/wallets/BaseSigner';
import { ethers } from 'ethers';
import { safeStorage } from 'electron';
import Realm from '../../../..';

export class RealmSigner implements BaseSigner {
  private core: Realm;
  constructor(core: Realm) {
    this.core = core;
  }
  setMnemonic(mnemonic: string, patp: string, passcode: string) {
    /*const encryptedMnemonic = safeStorage
      .encryptString(mnemonic)
      .toString('base64');*/
    this.core.services.identity.auth.setMnemonic(
      'realm.auth.set-mnemonic',
      patp,
      passcode,
      mnemonic,
    );
  }
  signTransaction(path: string, transaction: any, patp: string, passcode: string): any {
    const privateKey = this.getPrivateKey(patp, passcode);
    const wallet = new ethers.Wallet(privateKey.derivePath(path).privateKey);
    return wallet.signTransaction(transaction);
  }
  private getPrivateKey(patp: string, passcode: string) {
    const mnemonic =
      this.core.services.identity.auth.getMnemonic(null, patp, passcode);
    /*const mnemonic = safeStorage.decryptString(
      Buffer.from(encryptedMnemonic, 'base64')
    );*/
    return ethers.utils.HDNode.fromMnemonic(mnemonic);
  }
  getXpub(path: string, patp: string, passcode: string): string {
    return this.getPrivateKey(patp, passcode).derivePath(path).neuter().extendedKey;
  }
}
