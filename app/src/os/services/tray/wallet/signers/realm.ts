import { BaseSigner } from '../../wallet-lib/wallets/BaseSigner';
import { ethers } from 'ethers';
// import { safeStorage } from 'electron';
import Realm from '../../../..';
import { removeDots } from '../../../../api/uqbar';
import EncryptedStore from '../../../../lib/encryptedStore';

export class RealmSigner implements BaseSigner {
  private core: Realm;
  constructor(core: Realm) {
    this.core = core;
  }
  // TODO use the ethers encrypt wallet
  setMnemonic(mnemonic: string, patp: string, passcode: string) {
    /*const encryptedMnemonic = safeStorage
      .encryptString(mnemonic)
      .toString('base64');*/
    /*this.core.services.identity.auth.setMnemonic(
      'realm.auth.set-mnemonic',
      patp,
      passcode,
      mnemonic,
    );*/
    const storeParams = {
      name: 'mnemonic',
      cwd: `realm.${patp}`,
      secretKey: passcode,
      accessPropertiesByDotNotation: true,
    };
    const db = new EncryptedStore<string>(storeParams);
    db.store = mnemonic;
  }
  signTransaction(
    path: string,
    message: any,
    patp: string,
    passcode: string
  ): any {
    const privateKey = this.getPrivateKey(patp, passcode);
    const wallet = new ethers.Wallet(privateKey.derivePath(path).privateKey);
    return wallet.signTransaction(message);
  }
  async signUqbarTransaction(
    path: string,
    hash: string,
    txn: any,
    patp: string,
    passcode: string
  ): Promise<any> {
    console.log('SIGNING UQBAR');
    const ethTx = {
      to: removeDots(txn.to).substring(0, 42),
      value: '0x0',
      gasPrice: '0x' + txn.rate.toString(16),
      gasLimit: txn.budget === '0' ? '0x0' : ethers.utils.hexlify(txn.budget),
      nonce: Number(removeDots(txn.nonce)),
      chainId: parseInt(txn.town, 16),
      data: removeDots(hash),
      // value: ethers.utils.parseUnits(1, "ether")._hex
    };
    const ethHash = ethers.utils.serializeTransaction(ethTx);
    console.log('ethHash', ethHash);
    const keccak = ethers.utils.keccak256(ethHash);
    console.log('keccak', keccak);
    const privateKey = this.getPrivateKey(patp, passcode);
    const wallet = new ethers.Wallet(privateKey.derivePath(path).privateKey);
    console.log('signing the thing', ethHash.substring(2));
    const msgHash = ethers.utils.keccak256(ethHash); // as specified by ECDSA
    console.log('hash generated: ', msgHash);
    const otherSig = await wallet.signTransaction(ethTx);
    console.log('otherSig', otherSig);
    const oursig = ethers.utils.parseTransaction(otherSig);
    console.log('our', oursig);
    const mySig = { v: oursig.v, r: oursig.r, s: oursig.s };
    return { ethHash, sig: mySig };
  }
  private getPrivateKey(patp: string, passcode: string) {
    /*const mnemonic = 
      this.core.services.identity.auth.getMnemonic(null, patp, passcode);*/
    const storeParams = {
      name: 'mnemonic',
      cwd: `realm.${patp}`,
      secretKey: passcode,
      accessPropertiesByDotNotation: true,
    };
    const db = new EncryptedStore<string>(storeParams);
    const mnemonic = db.store;
    /*const mnemonic = safeStorage.decryptString(
      Buffer.from(encryptedMnemonic, 'base64')
    );*/
    return ethers.utils.HDNode.fromMnemonic(mnemonic);
  }
  getXpub(path: string, patp: string, passcode: string): string {
    return this.getPrivateKey(patp, passcode).derivePath(path).neuter()
      .extendedKey;
  }
  deleteMnemonic(patp: string, passcode: string) {
    const storeParams = {
      name: 'mnemonic',
      cwd: `realm.${patp}`,
      secretKey: passcode,
      accessPropertiesByDotNotation: true,
    };
    const db = new EncryptedStore<string>(storeParams);
    db.delete();
  }
}
