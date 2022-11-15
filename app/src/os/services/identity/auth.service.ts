import { ipcMain, ipcRenderer, safeStorage } from 'electron';
import Store from 'electron-store';
import { toJS } from 'mobx';
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
import { getCookie, ShipConnectionData } from '../../lib/shipHelpers';

export type ShipCredentials = {
  // needed to refresh cookie when stale (403)
  code: string;
};

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
    'realm.auth.set-mnemonic': this.setMnemonic,
    'realm.auth.set-ship-profile': this.setShipProfile,
    'realm.auth.cancel-login': this.cancelLogin,
  };

  static preload = {
    login: (ship: string, password: string) =>
      ipcRenderer.invoke('realm.auth.login', ship, password),
    logout: (ship: string) => ipcRenderer.invoke('realm.auth.logout', ship),
    refresh: () => ipcRenderer.invoke('realm.auth.refresh'),
    setFirstTime: () => ipcRenderer.invoke('realm.auth.set-first-time'),
    cancelLogin: () => ipcRenderer.invoke('realm.auth.cancel-login'),
    setSelected: (ship: string) =>
      ipcRenderer.invoke('realm.auth.set-selected', ship),
    setOrder: (order: any[]) =>
      ipcRenderer.invoke('realm.auth.set-order', order),
    addShip: (newShip: { ship: string; url: string; code: string }) =>
      ipcRenderer.invoke('realm.auth.add-ship', newShip),
    getShips: () => ipcRenderer.invoke('realm.auth.get-ships'),
    removeShip: (ship: string) =>
      ipcRenderer.invoke('realm.auth.remove-ship', ship),
    setMnemonic: (mnemonic: string) =>
      ipcRenderer.invoke('realm.auth.set-mnemonic', mnemonic),
    setShipProfile: (
      patp: string,
      profile: { color: string; nickname: string; avatar: string }
    ) => ipcRenderer.invoke('realm.auth.set-ship-profile', patp, profile),
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

  get currentShip() {
    return this.state.currentShip;
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

  getShip(ship: string): AuthShipType {
    return this.db.get(`ships.auth${ship}`);
  }

  setShipProfile(
    _event: any,
    patp: string,
    profile: { color: string; nickname: string; avatar: string }
  ) {
    let ship = this.state.ships.get(`auth${patp}`)!;
    if (!ship) return;
    this.state.setShipProfile(
      ship.id,
      profile.nickname,
      profile.color,
      profile.avatar
    );
  }

  storeCredentials(
    patp: string,
    secretKey: string,
    credentials: ShipCredentials
  ): ShipCredentials {
    // console.log('storeCredentials => %o', { patp, secretKey, credentials });
    const storeParams = {
      name: 'credentials',
      cwd: `realm.${patp}`,
      secretKey: secretKey,
      accessPropertiesByDotNotation: true,
    };
    // const db =
    //   process.env.NODE_ENV === 'development'
    //     ? new Store<ShipCredentials>(storeParams)
    //     : new EncryptedStore<ShipCredentials>(storeParams);
    const db = new Store<ShipCredentials>(storeParams);
    db.store = credentials;
    return credentials;
  }

  readCredentials(patp: string, secretKey: string): ShipCredentials {
    // console.log('readCredentials => %o', { patp, secretKey });
    const storeParams = {
      name: 'credentials',
      cwd: `realm.${patp}`,
      secretKey: secretKey,
      accessPropertiesByDotNotation: true,
    };
    // const db =
    //   process.env.NODE_ENV === 'development'
    //     ? new Store<ShipCredentials>(storeParams)
    //     : new EncryptedStore<ShipCredentials>(storeParams);
    const db = new Store<ShipCredentials>(storeParams);
    return db.store;
  }

  async login(_event: any, patp: string, password: string): Promise<boolean> {
    let shipId = `auth${patp}`;
    this.state.setLoader('loading');

    let ship = this.state.ships.get(`auth${patp}`)!;
    if (!ship) return false;

    if (ship.passwordHash === null) {
      throw new Error('login: passwordHash is null');
    }
    let passwordCorrect = await bcrypt.compare(password, ship.passwordHash);
    this.core.sendLog(`passwordHash: ${ship.passwordHash}`);
    this.core.sendLog(`passwordCorrect: ${passwordCorrect}`);

    if (!passwordCorrect) {
      this.core.sendLog(`password incorrect`);
      this.state.setLoader('error');
      return false;
    }
    this.core.sendLog(`ship: ${patp}`);
    this.core.passwords.setPassword(patp, password);
    this.core.sendLog(
      `safeStorage isEncryptionAvailable: ${safeStorage.isEncryptionAvailable()}`
    );

    this.state.login(shipId);

    this.core.services.desktop.setMouseColor(null, this.state.selected?.color!);
    this.core.services.shell.setBlur(null, false);

    // it appears this can happen if you finish onboarding and close the app/process
    //  before logging in. since cookie will not exist in session.lock file under this condition
    //  therefore grab and store it now
    const { code } = this.readCredentials(patp, password);
    const cookie = await getCookie({ patp, url: ship.url, code: code });

    this.core.setSession({
      ship: patp,
      url: ship.url,
      cookie,
      code: code,
    });

    return true;
  }

  cancelLogin(_event: any) {
    this.state.setLoader('error');
  }

  async logout(_event: any, ship: string) {
    this.core.services.ship.rooms.resetLocal(null);
    try {
      await this.core.services.ship.rooms.exitRoom(null);
    } catch (err) {
      console.log(err);
    }
    await this.core.clearSession();
    this.core.passwords.clearPassword(ship);
    this.core.services.ship.logout();
  }

  storeNewShip(ship: AuthShipType) {
    console.log('storeNewShip', toJS(ship));

    const newShip = AuthShip.create(ship);

    this.state.setShip(newShip);
    newShip.setStatus('completed');

    this.state.completeSignup(newShip.id);
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

  setMnemonic(_event: any, mnemonic: string) {
    this.state.setMnemonic(mnemonic);
  }

  getMnemonic(_event: any) {
    return this.state.mnemonic;
  }
}
