import { BaseSigner } from '../../wallet-lib/wallets/BaseSigner';
import { ethers } from 'ethers';
import { safeStorage } from 'electron';
import Realm from '../../../..';
import { removeDots } from '../../../../api/uqbar';

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
  signUqbarTransaction(path: string, hash: string, txn: any): any {
    console.log('signing hash', hash);
    console.log('txn', txn);
    const ethHash = ethers.utils.serializeTransaction({
      to: removeDots(txn.to).substring(0, 42),
      gasPrice: '0x' + txn.rate.toString(16),
      gasLimit: ethers.utils.hexlify(txn.budget),
      nonce: txn.nonce,
      chainId: parseInt(txn.town, 16),
      data: removeDots(hash),
      // value: ethers.utils.parseUnits(1, "ether")._hex
    })
    const sig = this.signTransaction(path, ethHash);
    return { ethHash, sig };
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
