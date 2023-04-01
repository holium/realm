import RealmProcess from '../background/realm.process';
import { app, BrowserWindow } from 'electron';
import log from 'electron-log';
import AbstractService from './services-new/abstract.service';
import { AuthService } from './services-new/auth/auth.service';
import { ShipService } from './services-new/ship/ship.service';

export class RealmService extends AbstractService {
  protected mainWindow: BrowserWindow;
  public services: {
    auth: AuthService;
    ship?: ShipService;
  };
  private realmProcess: RealmProcess | null = null;

  constructor(mainWindow: BrowserWindow) {
    super('realmService');
    this.mainWindow = mainWindow;
    this.services = {
      auth: new AuthService(),
    };
    // on electron app quit, stop the realm process
    app.on('quit', () => {
      this.realmProcess?.stop();
    });
  }

  async login(patp: string, password: string): Promise<boolean> {
    const isAuthenticated = this.services.auth.login(patp, password);
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
