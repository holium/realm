import { BrowserWindow, ipcMain, ipcRenderer } from 'electron';
import { EventEmitter } from 'stream';
import Store from 'electron-store';
// ---
import { Conduit, ConduitState } from '@holium/conduit';
import { AuthService } from './services/identity/auth.service';
import { ShipService } from './services/ship/ship.service';
import { SpacesService } from './services/spaces/spaces.service';
import { DesktopService } from './services/shell/desktop.service';
import { ShellService } from './services/shell/shell.service';
import { WalletService } from './services/tray/wallet.service';
import { OnboardingService } from './services/onboarding/onboarding.service';
import { toJS } from 'mobx';
import HoliumAPI from './api/holium';
import { RoomsService } from './services/tray/rooms.service';
import PasswordStore from './lib/passwordStore';
import { getSnapshot } from 'mobx-state-tree';

export interface ISession {
  ship: string;
  url: string;
  cookie: string;
}

export class Realm extends EventEmitter {
  conduit?: Conduit;
  private isResuming: boolean = false;
  readonly mainWindow: BrowserWindow;
  private session?: ISession;
  private db: Store<ISession>;
  readonly services: {
    onboarding: OnboardingService;
    identity: {
      auth: AuthService;
    };
    ship: ShipService;
    spaces: SpacesService;
    desktop: DesktopService;
    shell: ShellService;
  };
  readonly holiumClient: HoliumAPI;
  readonly passwords: PasswordStore;

  readonly handlers = {
    'realm.boot': this.boot,
  };

  static preload = {
    boot: () => {
      return ipcRenderer.invoke('realm.boot');
    },
    install: (ship: string) => {
      return ipcRenderer.invoke('core:install-realm', ship);
    },
    onEffect: (callback: any) => ipcRenderer.on('realm.on-effect', callback),
    onBoot: (callback: any) => ipcRenderer.on('realm.on-boot', callback),

    onLogin: (callback: any) => ipcRenderer.on('realm.on-login', callback),
    onConnected: (callback: any) =>
      ipcRenderer.on('realm.on-connected', callback),
    onConnectionStatus: (callback: any) =>
      ipcRenderer.on('realm.on-connection-status', callback),
    onLogout: (callback: any) => ipcRenderer.on('realm.on-logout', callback),
  };

  constructor(mainWindow: BrowserWindow) {
    super();
    this.mainWindow = mainWindow;
    this.onEffect = this.onEffect.bind(this);
    this.onBoot = this.onBoot.bind(this);
    this.onConduit = this.onConduit.bind(this);

    // Load session data
    this.db = new Store({
      name: 'realm.session',
      accessPropertiesByDotNotation: true,
      fileExtension: 'lock',
    });
    if (this.db.size > 0) {
      this.isResuming = true;
      this.setSession(this.db.store);
    }
    // Create an instance of all services
    this.services = {
      onboarding: new OnboardingService(this),
      identity: {
        auth: new AuthService(this),
      },
      ship: new ShipService(this),
      spaces: new SpacesService(this),
      desktop: new DesktopService(this),
      shell: new ShellService(this),
    };

    this.holiumClient = new HoliumAPI();
    this.passwords = new PasswordStore();

    Object.keys(this.handlers).forEach((handlerName: any) => {
      // @ts-ignore
      ipcMain.handle(handlerName, this.handlers[handlerName].bind(this));
    });

    // Setup mainWindow event handling
    // this.mainWindow.on('restore', async () => {
    //   await this.conduit?.closeChannel();
    //   this.conduit = undefined;
    // });
    // when closing for any reason, crash, user clicks close etc.
    this.mainWindow.on('close', () => {
      this.conduit?.closeChannel();
      this.services.shell.closeDialog(null);
      this.conduit = undefined;
    });
  }

  static start(mainWindow: BrowserWindow) {
    return new Realm(mainWindow);
  }

  async boot(_event: any) {
    let ship = null;
    let spaces = null;
    let desktop = null;
    let shell = null;
    let membership = null;
    let bazaar = null;
    let rooms = null;
    let wallet = null;
    let models = {};

    if (this.session) {
      this.onEffect({
        response: 'status',
        data: 'boot:resuming',
      });
      ship = this.services.ship.snapshot;
      models = this.services.ship.modelSnapshots;
      spaces = this.services.spaces.snapshot;
      desktop = this.services.desktop.snapshot;
      shell = this.services.shell.snapshot;
      bazaar = this.services.spaces.bazaarSnapshot;
      membership = this.services.spaces.membershipSnapshot;
      rooms = this.services.ship.roomSnapshot;
      wallet = this.services.ship.walletSnapshot;
    }

    const bootPayload = {
      auth: this.services.identity.auth.snapshot,
      onboarding: this.services.onboarding.snapshot,
      ship,
      spaces,
      desktop,
      shell,
      bazaar,
      membership,
      rooms,
      wallet,
      models,
      loggedIn: this.session ? true : false,
    };
    // Send boot payload to any listeners
    this.onBoot(bootPayload);

    this.services.identity.auth.setLoader('loaded');
    return bootPayload;
  }

  get credentials() {
    return this.session;
  }

  async connect(session: ISession) {
    if (!this.conduit) {
      this.conduit = new Conduit();
      this.handleConnectionStatus(this.conduit);
    }
    try {
      // wait for the init function to resolve
      await this.conduit.init(
        session.url,
        session.ship.substring(1),
        session.cookie
      );
    } catch (e) {
      console.log(e);
      this.clearSession();
    } finally {
      this.onConduit();
    }
  }

  setSession(session: ISession): void {
    this.session = session;
    this.db.set(session);
    this.connect(session);
  }

  getSession(session: ISession): ISession {
    this.session = session;
    return this.db.store;
  }

  async clearSession(): Promise<void> {
    await this.conduit?.closeChannel();
    this.conduit = undefined;
    this.db.clear();
    this.session = undefined;
  }

  async onConduit() {
    const sessionPatp = this.session?.ship!;
    const { ship, models } = await this.services.ship.subscribe(
      sessionPatp,
      this.session
    );
    await this.services.spaces.load(sessionPatp, models.docket);
    // console.log(toJS(models.courier));
    this.services.onboarding.reset();
    this.mainWindow.webContents.send('realm.on-connected', {
      ship: getSnapshot(ship),
      models,
    });
    if (!this.isResuming) {
      this.mainWindow.webContents.send('realm.on-login');
    }
    this.services.identity.auth.setLoader('loaded');
    this.isResuming = false;
  }

  /**
   * Sends effect data to client store
   *
   * @param data
   */
  onEffect(data: any): void {
    this.mainWindow.webContents.send('realm.on-effect', data);
  }

  /**
   * Sends boot data to client store
   *
   * @param data
   */
  onBoot(data: any): void {
    this.mainWindow.webContents.send('realm.on-boot', data);
  }

  /**
   * Relays the current connection status to renderer
   *
   * @param conduit
   */
  handleConnectionStatus(conduit: Conduit) {
    conduit.on(ConduitState.Initialized, () =>
      this.sendConnectionStatus(ConduitState.Initialized)
    );
    conduit.on(ConduitState.Connected, () =>
      this.sendConnectionStatus(ConduitState.Connected)
    );
    conduit.on(ConduitState.Disconnected, () =>
      this.sendConnectionStatus(ConduitState.Disconnected)
    );
    conduit.on(ConduitState.Failed, () => {
      this.services.identity.auth.setLoader('error');
      this.isResuming = false;
      this.sendConnectionStatus(ConduitState.Failed);
    });
  }

  sendConnectionStatus(status: ConduitState) {
    if (!this.mainWindow.isDestroyed()) {
      this.mainWindow.webContents.send('realm.on-connection-status', status);
    }
  }
}

export default Realm;
