import AbstractService, { ServiceOptions } from '../abstract.service';
import log from 'electron-log';
import bcrypt from 'bcryptjs';
import { AuthDB } from './auth.db';
import { Account } from './models/accounts.db';

export class AuthService extends AbstractService {
  private readonly authDB?: AuthDB;
  constructor(options?: ServiceOptions) {
    super('authService', options);
    if (options?.preload) {
      return;
    }
    this.authDB = new AuthDB();
    this.sendUpdate({ type: 'accounts', data: this.getAccounts() });
  }

  public getAccounts(): Account[] {
    if (!this.authDB) return [];
    return this.authDB.models.accounts.find();
  }

  /**
   *
   * @param patp
   * @param password
   * @returns boolean - true if login was successful, false otherwise
   */
  public login(patp: string, password: string): boolean {
    const account = this.authDB?.models.accounts.findOne(patp);
    if (!account) {
      log.info(`No account found for ${patp}`);
      return false;
    }
    // TODO Add amplitude logging here
    return this._verifyPassword(password, account.passwordHash);
  }

  public logout(): void {
    // TODO Add amplitude logging here
    // TODO Stop the realm process
  }

  private _verifyPassword(password: string, hash: string): boolean {
    return bcrypt.compareSync(password, hash);
  }
}

export default AuthService;

// Generate preload
export const authPreload = AuthService.preload(
  new AuthService({ preload: true })
);

// public register(patp: string, password: string): boolean {
//   const account = this.authDB.models.accounts.findOne(patp);
//   if (account) {
//     log.info(`Account already exists for ${patp}`);
//     return false;
//   }
//   const passwordHash = bcrypt.hashSync(password, 10);
//   this.authDB.models.accounts.create({ patp, passwordHash });
//   // TODO Add amplitude logging here
//   return true;
// }
