import {
  BrowserWindow,
  ipcMain,
  ipcRenderer,
  WebContents,
  dialog,
  session,
  WebPreferences,
} from 'electron';
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
import { ThemeModelType } from './services/theme.model';
import { getCookie } from './lib/shipHelpers';

export interface ISession {
  ship: string;
  url: string;
  cookie: string | null;
  code: string;
}

export type ConnectParams = { reconnecting: boolean };

export class Realm extends EventEmitter {
  conduit?: Conduit;
  private isResuming: boolean = false;
  private isReconnecting: boolean = false;
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
    'realm.reconnect': this.reconnect,
    'realm.disconnect': this.disconnect,
    'realm.refresh': this.refresh,
    'realm.show-open-dialog': this.showOpenDialog,
  };

  static preload = {
    boot: () => {
      return ipcRenderer.invoke('realm.boot');
    },
    refresh: () => {
      return ipcRenderer.invoke('realm.refresh');
    },
    reconnect: () => {
      return ipcRenderer.invoke('realm.reconnect');
    },
    disconnect: () => {
      return ipcRenderer.invoke('realm.disconnect');
    },
    install: (ship: string) => {
      return ipcRenderer.invoke('core:install-realm', ship);
    },
    showOpenDialog: () => {
      return ipcRenderer.invoke('realm.show-open-dialog');
    },
    onSetTheme: (callback: any) =>
      ipcRenderer.on('realm.change-theme', callback),
    onLog: (callback: any) => ipcRenderer.on('realm.on-log', callback),
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
    this.onWebViewAttached = this.onWebViewAttached.bind(this);
    this.onWillRedirect = this.onWillRedirect.bind(this);

    const options = {
      name: 'realm.session',
      accessPropertiesByDotNotation: true,
      fileExtension: 'lock',
    };
    // this.db =
    //   process.env.NODE_ENV === 'development'
    //     ? new Store(options)
    //     : new EncryptedStore(options);
    // Load session data
    this.db = new Store(options);
    if (this.db.size > 0 && this.db.store.cookie !== null) {
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

    this.mainWindow.webContents.on(
      'did-attach-webview',
      this.onWebViewAttached
    );
    this.mainWindow.webContents.on(
      'will-attach-webview',
      (
        event: Electron.Event,
        webPreferences: WebPreferences,
        params: Record<string, string>
      ) => {
        webPreferences.partition = 'urbit-webview';
      }
    );
  }

  static start(mainWindow: BrowserWindow) {
    return new Realm(mainWindow);
  }

  async boot(_event: any) {
    let ship = null;
    let spaces = null;
    let desktop = this.services.desktop.snapshot;
    let shell = this.services.shell.snapshot;
    let membership = null;
    let bazaar = null;
    let rooms = null;
    let wallet = null;
    let visas = null;
    let models = {};

    if (this.session) {
      ship = this.services.ship.snapshot;
      models = this.services.ship.modelSnapshots;
      spaces = this.services.spaces.snapshot;
      rooms = this.services.ship.roomSnapshot;
      wallet = this.services.ship.walletSnapshot;
      bazaar = this.services.spaces.modelSnapshots.bazaar;
      membership = this.services.spaces.modelSnapshots.membership;
      visas = this.services.spaces.modelSnapshots.visas;
    }

    if (this.conduit) {
      console.log('boot conduit', this.conduit.status);
      this.sendConnectionStatus(this.conduit.status);
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
      visas,
      rooms,
      wallet,
      models,
      loggedIn: this.session ? true : false,
    };
    // if (spaces?.selected) {
    //   this.setTheme({ ...spaces!.selected!.theme, id: spaces?.selected.path });
    // }
    // Send boot payload to any listeners
    this.onBoot(bootPayload);

    this.services.identity.auth.setLoader('loaded');
    return bootPayload;
  }

  get credentials() {
    return this.session;
  }

  async disconnect() {
    this.conduit?.closeChannel();
    this.isResuming = true;
    this.conduit = undefined;
  }

  async refresh() {
    if (!this.session) {
      console.log('Conduit.refresh called with unexpected session');
      return;
    }
    if (!this.conduit) {
      console.log('Conduit.refresh called with unexpected conduit');
      return;
    }
    this.isReconnecting = true;
    try {
      console.log('refreshing token => %o', this.session);
      const cookie: string | undefined = await this.conduit.refresh(
        this.session.url,
        this.session.code
      );
      if (this.session) {
        this.saveSession({ ...this.session, cookie: cookie || null });
      } else {
        console.warn('unexpected session => %o', this.session);
      }
    } catch (e) {
      console.log(e);
    }
  }

  async reconnect() {
    this.conduit?.closeChannel();
    this.conduit = undefined;

    if (this.session) {
      this.isReconnecting = true;
      return await this.connect(this.session, {
        reconnecting: true,
      });
    }
  }

  async connect(
    session: ISession,
    params: ConnectParams = { reconnecting: false }
  ) {
    this.sendLog('connecting conduit');
    if (!this.conduit) {
      this.conduit = new Conduit();
      this.handleConnectionStatus(this.conduit);
    }
    try {
      // wait for the init function to resolve
      this.sendLog(JSON.stringify(session));

      await this.conduit.init(
        session.url,
        session.ship.substring(1),
        session.cookie!,
        session.code
      );
      this.sendLog('after conduit init');
      this.sendLog('connection successful');
      this.onConduit(params);
    } catch (e) {
      console.log(e);
      this.sendLog('error');
      this.sendLog(e);
      this.clearSession();
    }
  }

  async showOpenDialog(_event: any) {
    return dialog.showOpenDialogSync({
      properties: ['openFile'],
    });
  }

  setSession(session: ISession): void {
    this.saveSession(session);
    this.connect(session);
  }

  saveSession(session: ISession): void {
    this.session = session;
    this.db.set(session);
  }

  getSession(): ISession {
    return this.session!;
  }

  async clearSession(): Promise<void> {
    await this.conduit?.closeChannel();
    this.conduit = undefined;
    this.db.clear();
    this.session = undefined;
  }

  async onWillRedirect(e: Event, url: string, webContents: WebContents) {
    try {
      // console.log('onWillRedirect => %o', url);
      const delim = '/~/login?redirect=';
      const parts = url.split(delim);
      // http://localhost/~/login?redirect=
      if (parts.length > 0) {
        let appPath = decodeURIComponent(parts[1]);
        // console.log('appPath => %o', appPath);
        appPath = appPath.split('?')[0];
        if (appPath.endsWith('/')) {
          appPath = appPath.substring(0, appPath.length - 1);
        }
        // const redirectUrl = parts[1];
        // const newUrl = `${parts[0]}${redirectUrl}`;
        e.preventDefault();

        if (!this.session) {
          console.log('unable to redirect. invalid session');
          return;
        }
        const { ship, code } = this.session;
        console.log(
          'child window attempting to redirect to login. refreshing cookie...'
        );
        const cookie = await getCookie({
          patp: ship,
          url: this.session.url,
          code: code,
        });
        console.log(
          'new cookie generated. reloading child window and saving new cookie to session.'
        );
        // console.log(cookie);
        // console.log('cookie => %o', cookie);
        // console.log('session => %o', {
        //   url: `${this.session.url}${appPath}`,
        //   name: `urbauth-${ship}`,
        //   value: cookie.split('=')[1].split('; ')[0],
        // });
        await session.fromPartition(`urbit-webview`).cookies.set({
          url: `${this.session.url}${appPath}`,
          name: `urbauth-${ship}`,
          value: cookie.split('=')[1].split('; ')[0],
          // value: cookie,
        });
        this.saveSession({
          ...this.session,
          cookie,
        });
        // console.log('navigating to => %o', newUrl);
        // webContents.loadURL(newUrl);
        webContents.reload();
      }
    } catch (e) {
      console.error(e);
    }
  }

  async onWebViewAttached(e: Event, webContents: WebContents) {
    // console.log('onWebViewAttached');
    webContents.on('will-redirect', (e: Event, url: string) =>
      this.onWillRedirect(e, url, webContents)
    );
  }

  async onConduit(params: ConnectParams) {
    // this.sendConnectionStatus(this.conduit?.status);
    const sessionPatp = this.session?.ship!;
    this.sendLog(`before ship subscribe ${this.session?.ship!}`);
    await this.services.ship.subscribe(sessionPatp, this.session);
    this.sendLog('after ship subscribe');
    await this.services.spaces.load(sessionPatp, params.reconnecting);
    this.services.onboarding.reset();
    this.mainWindow.webContents.send('realm.on-connected', {
      ship: this.services.ship.snapshot,
      models: this.services.ship.modelSnapshots,
    });
    if (!this.isResuming && !params.reconnecting) {
      this.mainWindow.webContents.send('realm.on-login');
    }
    this.services.identity.auth.setLoader('loaded');
    this.isResuming = false;
    if (this.isReconnecting) this.isReconnecting = false;
  }

  /**
   * Sends effect data to client store
   *
   * @param data
   */
  onEffect(data: any): void {
    this.mainWindow.webContents.send('realm.on-effect', data);
  }

  setTheme(theme: ThemeModelType) {
    this.mainWindow.webContents.send('realm.change-theme', toJS(theme));
  }

  /**
   * Sends boot data to client store
   *
   * @param data
   */
  onBoot(data: any): void {
    this.mainWindow.webContents.send('realm.on-boot', data);
  }

  sendLog(data: any): void {
    this.mainWindow.webContents.send('realm.on-log', data.toString());
  }

  /**
   * Relays the current connection status to renderer
   *
   * @param conduit
   */
  handleConnectionStatus(conduit: Conduit) {
    conduit.removeAllListeners();
    // conduit.on(ConduitState.Initialized, );
    conduit.on(ConduitState.Initialized, () => {
      if (!this.isReconnecting) {
        this.sendConnectionStatus(ConduitState.Initialized);
      }
    });
    conduit.on(ConduitState.Refreshed, (session) => {
      // console.info(`ConduitState.Refreshed => %o`, session);
      this.saveSession(session);
      this.sendConnectionStatus(ConduitState.Refreshed);
    });
    conduit.on(ConduitState.Connected, () => {
      this.sendConnectionStatus(ConduitState.Connected);
    });
    conduit.on(ConduitState.Disconnected, () =>
      this.sendConnectionStatus(ConduitState.Disconnected)
    );
    conduit.on(ConduitState.Connecting, () => {
      this.sendConnectionStatus(ConduitState.Connecting);
    });
    conduit.on(ConduitState.Failed, () => {
      this.services.identity.auth.setLoader('error');
      this.isResuming = false;
      this.isReconnecting = false;
      this.sendConnectionStatus(ConduitState.Failed);
    });
    conduit.on(ConduitState.Stale, () => {
      this.sendLog('stale connection');
      this.sendConnectionStatus(ConduitState.Stale);
    });
  }

  sendConnectionStatus(status: ConduitState) {
    if (!this.mainWindow.isDestroyed()) {
      this.mainWindow.webContents.send('realm.on-connection-status', status);
    }
  }
}

export default Realm;
