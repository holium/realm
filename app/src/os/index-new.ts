import RealmProcess from '../background/realm.process';
import { app, ipcRenderer } from 'electron';
import log from 'electron-log';
import AbstractService, {
  ServiceOptions,
} from './services-new/abstract.service';
import { AuthService } from './services-new/auth/auth.service';
import { ShipService } from './services-new/ship/ship.service';

export class RealmService extends AbstractService {
  public services?: {
    auth: AuthService;
    ship?: ShipService;
  };
  private realmProcess: RealmProcess | null = null;

  constructor(options?: ServiceOptions) {
    super('realmService', options);
    if (options?.preload) return;
    this.services = {
      auth: new AuthService(),
    };
    // on electron app quit, stop the realm process
    app.on('quit', () => {
      this.realmProcess?.stop();
    });

    this.sendUpdate({ type: 'booted', payload: null });
  }

  /**
   * ------------------------------
   * boot
   * ------------------------------
   * Boot the realm service. Eventually this will start a background process
   * that will handle all realm related tasks per window.
   *
   * @returns void
   */
  async boot() {
    this.sendUpdate({
      type: 'booted',
      payload: {
        screen: 'login',
        accounts: this.services?.auth.getAccounts(),
      },
    });
  }

  async login(patp: string, password: string): Promise<boolean> {
    if (!this.services) {
      return false;
    }
    const isAuthenticated = this.services?.auth.login(patp, password);
    if (!isAuthenticated) {
      log.warn(`${patp} failed to authenticate`);
      return false;
    }
    if (isAuthenticated) {
      log.info(`${patp} authenticated`);
      this.services.ship = new ShipService(patp, password);
      // console.log(this.services.ship.getMessages());
    }
    return isAuthenticated;
  }

  // private startBackgroundProcess(): void {
  //   if (this.realmProcess) {
  //     return;
  //   }

  //   this.realmProcess = new RealmProcess();
  //   this.realmProcess.start();
  // }
}

// Generate preload
export const realmPreload = RealmService.preload(
  new RealmService({ preload: true })
);
