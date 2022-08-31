import { safeStorage } from "electron";

export default class PasswordStore {
  private passwords;

  constructor() {
    this.passwords = new Map<string, Buffer | null>()
  }

  getPassword(patp: string) {
    let passwordBuffer = this.passwords.get(patp);
    if (!passwordBuffer)
      return null

    return safeStorage.decryptString(passwordBuffer);
  }

  setPassword(patp: string, password: string) {
    let passwordBuffer = safeStorage.encryptString(password);
    this.passwords.set(patp, passwordBuffer);

  }

  clearPassword(patp: string) {
    this.passwords.set(patp, null);
  }
}
