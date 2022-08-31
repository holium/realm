import { ipcMain, ipcRenderer } from 'electron';
import Store from 'electron-store';
import {
  onPatch,
  onSnapshot,
  getSnapshot,
  castToSnapshot,
} from 'mobx-state-tree';
import bcrypt from 'bcryptjs';

import Realm from '../..';
import { BaseService } from '../base.service';
import { AuthShip, AuthShipType, AuthStore, AuthStoreType } from './auth.model';
import axios from 'axios';

/**
 * AuthService
 */
export class AuthService extends BaseService {
  private db: Store<AuthStoreType>;
  private state: AuthStoreType;

  handlers = {
    'realm.auth.add-ship': this.addShip,
    'realm.auth.get-ships': this.getShips,
    'realm.auth.set-first-time': this.setFirstTime,
    'realm.auth.set-selected': this.setSelected,
    'realm.auth.set-order': this.setOrder,
    'realm.auth.login': this.login,
    'realm.auth.logout': this.logout,
    'realm.auth.remove-ship': this.removeShip,
  };

  static preload = {
    login: (ship: string, password: string) =>
      ipcRenderer.invoke('realm.auth.login', ship, password),
    logout: (ship: string) => ipcRenderer.invoke('realm.auth.logout', ship),
    setFirstTime: () => ipcRenderer.invoke('realm.auth.set-first-time'),
    setSelected: (ship: string) =>
      ipcRenderer.invoke('realm.auth.set-selected', ship),
    setOrder: (order: any[]) =>
      ipcRenderer.invoke('realm.auth.set-order', order),
    addShip: (newShip: { ship: string; url: string; code: string }) =>
      ipcRenderer.invoke('realm.auth.add-ship', newShip),
    getShips: () => ipcRenderer.invoke('realm.auth.get-ships'),
    removeShip: (ship: string) =>
      ipcRenderer.invoke('realm.auth.remove-ship', ship),
    // onLogin: (callback: any) =>
    //   ipcRenderer.on('realm.auth.on-log-in', callback),
    // onLogout: (callback: any) =>
    //   ipcRenderer.on('realm.auth.on-log-out', callback),
  };

  constructor(core: Realm, options: any = {}) {
    super(core, options);
    this.db = new Store({
      name: 'realm.auth',
      accessPropertiesByDotNotation: true,
      defaults: AuthStore.create({ firstTime: true }),
    });
    Object.keys(this.handlers).forEach((handlerName: any) => {
      // @ts-ignore
      ipcMain.handle(handlerName, this.handlers[handlerName].bind(this));
    });
    let persistedState: AuthStoreType = this.db.store;
    this.state = AuthStore.create(castToSnapshot(persistedState));

    onSnapshot(this.state, (snapshot) => {
      this.db.store = castToSnapshot(snapshot);
    });

    onPatch(this.state, (patch) => {
      const patchEffect = {
        patch,
        resource: 'auth',
        key: null,
        response: 'patch',
      };
      this.core.onEffect(patchEffect);
    });
  }

  get loggedIn() {
    return this.state.isLoaded;
  }

  get snapshot() {
    return getSnapshot(this.state);
  }

  get accountId() {
    return this.state.accountId;
  }

  setAccountId(accountId: string) {
    this.state.setAccountId(accountId);
  }

  get clientSecret() {
    return this.state.clientSecret;
  }

  setClientSecret(secret: string) {
    this.state.setClientSecret(secret);
  }

  setLoader(state: 'initial' | 'loading' | 'error' | 'loaded') {
    this.state.setLoader(state);
  }

  setFirstTime() {
    this.state.setFirstTime();
  }

  getCredentials(ship: string, password: string) {
    const authShip = this.state.ships.get(`auth${ship}`)!;
    let url = authShip.url;
    let cookie = authShip.cookie || '';
    return { url, cookie };
  }

  getShip(ship: string): AuthShipType {
    return this.db.get(`ships.auth${ship}`);
  }

  async login(_event: any, ship: string, password: string): Promise<boolean> {
    let shipId = `auth${ship}`;
    this.state.setLoader('loading');

    let passwordHash = this.state.getPasswordHash(shipId);
    let passwordCorrect = await bcrypt.compare(password, passwordHash);
    if (!passwordCorrect) {
      this.state.setLoader('error');
      return false;
    }

    this.core.passwords.setPassword(ship, password);
    this.state.login(shipId);

    this.core.services.desktop.setMouseColor(null, this.state.selected?.color!);
    this.core.services.shell.setBlur(null, false);

    // TODO decrypt stored snapshot
    const { url, cookie } = this.getCredentials(ship, password);
    this.core.setSession({
      ship,
      url,
      cookie,
    });

    return true;
  }

  async logout(_event: any, ship: string) {
    await this.core.clearSession();
    this.core.passwords.clearPassword(ship);
    this.core.services.ship.logout();
  }

  storeNewShip(ship: AuthShipType) {
    const newShip = AuthShip.create(ship);

    this.state.setShip(newShip);
    newShip.setStatus('completed');
    console.log('completed');

    this.state.completeSignup(newShip.id);
    console.log('this.state.completeSignup(newShip.id);');
    return newShip;
  }

  async setSelected(_event: any, ship: string): Promise<void> {
    const selectedShip = this.state.ships.get(`auth${ship}`);
    this.state.setSelected(selectedShip!);
  }

  async setOrder(_event: any, order: any[]): Promise<void> {
    this.state.setOrder(order);
  }

  async addShip(
    _event: any,
    newShip: { ship: string; url: string; code: string }
  ) {
    const { ship, url, code } = newShip;
    const response = await axios.post(
      `${url}/~/login`,
      `password=${code.trim()}`,
      {
        withCredentials: true,
      }
    );

    const cookie = response.headers['set-cookie']![0];
    const id = `auth${ship}`;

    const parts = new RegExp(/(urbauth-~[\w-]+)=(.*); Path=\/;/).exec(
      cookie!.toString()
    )!;

    const newAuthShip = AuthShip.create({
      id,
      url,
      cookie,
      patp: ship,
      wallpaper:
        'https://images.unsplash.com/photo-1622547748225-3fc4abd2cca0?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2832&q=100',
    });

    this.db.set(`ships.${id}`, getSnapshot(newAuthShip));
    this.state.setShip(newAuthShip);

    return {
      url,
      cookie,
      patp: parts[1],
      value: parts[2],
    };
  }

  getShips() {
    return this.db.get('ships');
  }

  removeShip(_event: any, ship: string) {
    this.state.deleteShip(ship);
  }
}
