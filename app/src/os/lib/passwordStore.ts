import { safeStorage } from 'electron';

export default class PasswordStore {
  private readonly passwords;

  constructor() {
    this.passwords = new Map<string, Buffer | null>();
  }

  getPassword(patp: string) {
    const passwordBuffer = this.passwords.get(patp);
    if (!passwordBuffer) return null;

    return safeStorage.decryptString(passwordBuffer);
  }

  setPassword(patp: string, password: string) {
    const passwordBuffer = safeStorage.encryptString(password);
    this.passwords.set(patp, passwordBuffer);
  }

  clearPassword(patp: string) {
    this.passwords.set(patp, null);
  }
}
