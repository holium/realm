import { BrowserWindow, ipcMain, ipcRenderer } from 'electron';
import { EventEmitter } from 'stream';
import Store from 'electron-store';
// ---
import Urbit from './urbit/api';
import { AuthService } from './services/identity/auth.service';
import { MSTAction } from './types';
import { cleanPath, fromPathString } from './lib/action';
import { SignupService } from './services/identity/signup.service';
import { ShipService } from './services/ship/ship.service';
import { SpacesService } from './services/spaces/spaces.service';
import { DesktopService } from './services/shell/desktop.service';
import { OnboardingService } from './services/onboarding/onboarding.service';
import { toJS } from 'mobx';
import { ShipModelType } from './services/ship/models/ship';
import HoliumAPI from './api/holium';

export interface ISession {
  ship: string;
  url: string;
  cookie: string;
}

export class Realm extends EventEmitter {
  conduit?: Urbit;
  readonly mainWindow: BrowserWindow;
  private session?: ISession;
  private db: Store<ISession>;
  readonly services: {
    onboarding: OnboardingService;
    identity: {
      auth: AuthService;
      signup: SignupService;
    };
    ship: ShipService;
    spaces: SpacesService;
    shell: DesktopService;
  };
  readonly holiumClient: HoliumAPI;

  readonly handlers = {
    'realm.boot': this.boot,
    'realm.apply-action': this.applyAction,
  };

  static preload = {
    boot: () => {
      return ipcRenderer.invoke('realm.boot');
    },
    applyAction: (action: any) => {
      return ipcRenderer.invoke('realm.apply-action', action);
    },
    install: (ship: string) => {
      return ipcRenderer.invoke('core:install-realm', ship);
    },
    sendAction: (action: any) => {
      return ipcRenderer.invoke('core:send-action', action);
    },
    onEffect: (callback: any) => ipcRenderer.on('realm.on-effect', callback),
    auth: AuthService.preload,
    signup: SignupService.preload,
    ship: ShipService.preload,
    spaces: SpacesService.preload,
    shell: DesktopService.preload,
    onboarding: OnboardingService.preload
  };

  constructor(mainWindow: BrowserWindow) {
    super();
    this.mainWindow = mainWindow;
    this.onEffect = this.onEffect.bind(this);
    // Load session data
    this.db = new Store({
      name: 'realm.session',
      accessPropertiesByDotNotation: true,
      fileExtension: 'lock',
    });
    if (this.db.size > 0) {
      this.setSession(this.db.store);
    }
    // Create an instance of all services
    this.services = {
      onboarding: new OnboardingService(this),
      identity: {
        auth: new AuthService(this),
        signup: new SignupService(this),
      },
      ship: new ShipService(this),
      spaces: new SpacesService(this),
      shell: new DesktopService(this),
    };

    this.holiumClient = new HoliumAPI();

    Object.keys(this.handlers).forEach((handlerName: any) => {
      // @ts-ignore
      ipcMain.handle(handlerName, this.handlers[handlerName].bind(this));
    });
  }

  static start(mainWindow: BrowserWindow) {
    return new Realm(mainWindow);
  }

  async boot(_event: any) {
    let ship = null;
    let spaces = null;
    let shell = null;
    if (this.session) {
      ship = this.services.ship.snapshot;
      spaces = this.services.spaces.snapshot;
      shell = this.services.shell.snapshot;
    }
    this.services.identity.auth.setLoader('loaded');
    return {
      auth: this.services.identity.auth.snapshot,
      signup: this.services.identity.signup.snapshot,
      onboarding: this.services.onboarding.snapshot,
      ship,
      spaces,
      shell,
      loggedIn: this.session ? true : false,
    };
  }

  get credentials() {
    return this.session;
  }

  connect(session: ISession) {
    this.conduit = new Urbit(session.url, session.ship, session.cookie);
    this.conduit.open();
    this.conduit.onOpen = () => {
      this.onLogin();
    };
    this.conduit.onRetry = () => console.log('on retry');
    this.conduit.onError = (err) => console.log('on err', err);
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

  clearSession(): void {
    this.session = undefined;
    this.db.clear();
    this.conduit?.reset();
  }

  async onLogin() {
    const ship: ShipModelType = await this.services.ship.subscribe(
      this.session?.ship!,
      this.session
    );
    this.services.identity.auth.setLoader('loaded');
    this.services.onboarding.reset();
    this.mainWindow.webContents.send('realm.auth.on-log-in', toJS(ship));
  }

  /**
   *
   * Handles root level store actions from the client
   *
   * @param _event
   * @param action
   */
  async applyAction(_event: any, action: MSTAction): Promise<void> {
    const servicePath = cleanPath(action.path);
    // @ts-ignore
    // this.services[servicePath] //.applyAction(action);
    const service = fromPathString(servicePath, this.services);
    service.applyAction(action);
    // console.log(service);
  }

  /**
   * Sends effect data to client store
   *
   * @param data
   */
  onEffect(data: any): void {
    console.log(`hey from onEffect`)
    console.log(data);
    this.mainWindow.webContents.send('realm.on-effect', data);
  }
}

export default Realm;

export type OSPreloadType = typeof Realm.preload;
