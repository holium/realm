import { safeStorage } from 'electron';
import Store from 'electron-store';
import CryptoJS from 'crypto-js';

interface EncryptedStoreParams {
  name: string;
  cwd: string; // the folder where the data is stored
  secretKey: string;
  accessPropertiesByDotNotation?: boolean;
}

export default class EncryptedStore<T> {
  private db;
  private secretKey;
  private _store;

  constructor(params: EncryptedStoreParams) {
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
    return this.db.store && this.db.store.data
      ? this.decryptData(this.db.store.data)
      : null;
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
    let bytes = CryptoJS.AES.decrypt(
      ciphertext,
      safeStorage.decryptString(this.secretKey)
    );
    return JSON.parse(bytes.toString(CryptoJS.enc.Utf8)).data;
  }
}
