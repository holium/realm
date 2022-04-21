import Store from 'electron-store';
import isDev from 'electron-is-dev';
import crypto from 'crypto';
import { Buffer } from 'buffer';

const generateIv = () => {
  return crypto.randomBytes(32).toString('hex').slice(0, 16);
};

type SecureStoreOptions = {
  name: string;
  notSecured?: boolean;
};

export class SecureStore {
  private store: Store;
  private hashedPassphrase?: string;
  public isSecure: boolean = true;
  decryptedStore?: Store;

  constructor({ name, notSecured }: SecureStoreOptions) {
    this.store = new Store({
      name,
      encryptionKey: isDev ? undefined : '4ec5c12f34d1',
    });
    if (notSecured) {
      this.isSecure = false;
    }
    this.get = this.get.bind(this);
    this.get = this.get.bind(this);
  }

  decryptStore(passphrase: string) {
    // Get the store specific salt
    if (!this.store.get('salt')) {
      this.store.set('salt', crypto.randomBytes(32).toString('hex'));
    }
    const salt = this.store.get('salt');
    // create the hashedPassphrase
    this.hashedPassphrase = crypto
      .createHash('sha256')
      .update(String(passphrase + salt))
      .digest('base64');
  }

  // --------------------------------
  // ------- Store functions --------
  // --------------------------------
  // TODO encrypt
  bulkSet(value: any) {
    this.store.set(value);
  }
  set(key: string, value: any) {
    this.store.set(key, value);
  }
  get(key: string, defaultValue?: any) {
    this.store.get(key);
  }
  delete(key: string) {
    this.store.delete(key);
  }

  has(key: string) {
    this.store.has(key);
  }
  get all() {
    return this.store.store;
  }
  get size() {
    return this.store.size;
  }
  get path() {
    return this.store.path;
  }
  // --------------------------------
  // ------ Utility functions -------
  // --------------------------------
  changePassphrase(currentPassphrase: string, newPassphrase: string) {
    // 1. Check current passphrase against hash
    const oldSalt = this.store.get('salt');
    const currentHashedPassphrase = crypto
      .createHash('sha256')
      .update(String(currentPassphrase + oldSalt))
      .digest('base64');
    if (this.hashedPassphrase !== currentHashedPassphrase) {
      throw new Error('current passphrase incorrect');
    }
    // 2. Load all data with old password
    //
    // 3. Updated this.hashedPassphrase with new passphrase
    const newSalt = crypto.randomBytes(32).toString('hex');
    this.hashedPassphrase = crypto
      .createHash('sha256')
      .update(String(newPassphrase + newSalt))
      .digest('base64');
    return null;
  }
}

export default {};
