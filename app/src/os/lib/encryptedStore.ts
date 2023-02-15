import { safeStorage } from 'electron';
import Store from 'electron-store';
import CryptoJS from 'crypto-js';

interface EncryptedStoreParams {
  name: string;
  cwd: string; // the folder where the data is stored
  secretKey: string;
  accessPropertiesByDotNotation?: boolean;
}

export class EncryptedStore<T> {
  private db;
  private readonly secretKey;
  private _store;

  constructor(params: EncryptedStoreParams) {
    try {
      safeStorage.isEncryptionAvailable();
    } catch (e) {
      console.error('safeStorage.isEncryptionAvailable() failed', e);
    }
    this.secretKey = safeStorage.encryptString(params.secretKey);
    this.db = new Store<{ data: string }>({
      name: params.name,
      cwd: params.cwd,
      accessPropertiesByDotNotation: params?.accessPropertiesByDotNotation,
    });
    this._store = this.readEncryptedStore();
  }

  get store(): T {
    return this._store;
  }

  set store(storeData: T) {
    this.writeEncryptedStore(storeData);
    this._store = storeData;
  }

  readEncryptedStore(): any {
    // if the store is encrypted, decrypt it else return the store
    // this is to support the old version of the store and will
    // upgrade the store to the new version on the next write
    if (this.db.store && this.db.store.data) {
      return this.decryptData(this.db.store.data);
    } else {
      if (this.db.store) {
        console.log('store is not encrypted, should be upgraded');
        this.writeEncryptedStore(this.db.store);
        this._store = this.readEncryptedStore();
        return this._store;
      }
      console.error(`${this.db.path} is empty`);
    }
  }

  writeEncryptedStore(data: any): any {
    this.db.store = { data: this.encryptData(data) };
  }

  encryptData(data: any): string {
    return CryptoJS.AES.encrypt(
      JSON.stringify({ data }),
      safeStorage.decryptString(this.secretKey)
    ).toString();
  }

  decryptData(ciphertext: string) {
    const bytes = CryptoJS.AES.decrypt(
      ciphertext,
      safeStorage.decryptString(this.secretKey)
    );
    return JSON.parse(bytes.toString(CryptoJS.enc.Utf8)).data;
  }

  delete() {
    this.db.clear();
  }
}
