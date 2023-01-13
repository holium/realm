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
  signTransaction(path: string, message: any): any {
    const privateKey = this.getPrivateKey();
    const wallet = new ethers.Wallet(privateKey.derivePath(path).privateKey);
    return wallet.signTransaction(message);
  }
  async signUqbarTransaction(path: string, hash: string, txn: any, patp: string, passcode: string): Promise<any> {
    console.log('signing hash', hash);
    console.log('txn', txn);
    // ethers.utils;
    const ethHash = ethers.utils.serializeTransaction({
      to: removeDots(txn.to).substring(0, 42),
      gasPrice: '0x' + txn.rate.toString(16),
      gasLimit: txn.budget === '0' ? '0x0': ethers.utils.hexlify(txn.budget),
      nonce: Number(removeDots(txn.nonce)),
      chainId: parseInt(txn.town, 16),
      data: removeDots(hash),
      // value: ethers.utils.parseUnits(1, "ether")._hex
    })
    console.log('got through signing')
    const privateKey = this.getPrivateKey(patp, passcode);
    const wallet = new ethers.Wallet(privateKey.derivePath(path).privateKey);
    const flatSig = await wallet.signMessage(hash);
    const sig = ethers.utils.splitSignature(flatSig);
    return { ethHash, sig };
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
