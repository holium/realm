import Urbit from '../../../core-a/urbit/api';
import { ipcMain, ipcRenderer } from 'electron';
import Store from 'electron-store';
import {
  onPatch,
  onSnapshot,
  getSnapshot,
  castToSnapshot,
  clone,
  applyAction,
} from 'mobx-state-tree';

import Realm from '../..';
import { BaseService } from '../base.service';
import { AuthShip, AuthShipType, AuthStore, AuthStoreType } from './auth.model';
import { SignupStore, SignupStoreType } from './signup.model';

import axios from 'axios';
import { ContactApi } from '../../api/contacts';

/**
 * AuthService
 */
export class SignupService extends BaseService {
  private db: Store<SignupStoreType>; // for persistance
  private state: SignupStoreType; // for state management
  handlers = {
    'realm.signup.add-ship': this.addShip,
    'realm.signup.get-profile': this.getProfile,
    'realm.signup.save-profile': this.saveProfile,
    'realm.signup.complete-signup': this.completeSignup,
    'realm.signup.install': this.installRealm,
  };

  static preload = {
    addShip: (newShip: { ship: string; url: string; code: string }) => {
      return ipcRenderer.invoke('realm.signup.add-ship', newShip);
    },
    getProfile: (ship: string) => {
      return ipcRenderer.invoke('realm.signup.get-profile', ship);
    },
    saveProfile: (ship: string, data: any) => {
      return ipcRenderer.invoke('realm.signup.save-profile', ship, data);
    },
    createPassword: (ship: string, password: string) => {
      return ipcRenderer.invoke('realm.signup.create-password', ship, password);
    },
    completeSignup: () => {
      return ipcRenderer.invoke('realm.signup.complete-signup');
    },
    install: (ship: any) => {
      return ipcRenderer.invoke('realm.signup.install', ship);
    },
  };

  constructor(core: Realm, options: any = {}) {
    super(core, options);
    this.db = new Store({
      name: 'realm.signup',
      accessPropertiesByDotNotation: true,
      defaults: SignupStore.create(),
    });

    Object.keys(this.handlers).forEach((handlerName: any) => {
      // @ts-ignore
      ipcMain.handle(handlerName, this.handlers[handlerName].bind(this));
    });

    let persistedState: SignupStoreType = this.db.store;
    this.state = SignupStore.create(castToSnapshot(persistedState));

    onSnapshot(this.state, (snapshot) => {
      this.db.store = castToSnapshot(snapshot);
    });

    onPatch(this.state, (patch) => {
      const patchEffect = {
        patch,
        resource: 'signup',
        response: 'patch',
      };
      this.onEffect(patchEffect);
    });
  }

  get snapshot() {
    return getSnapshot(this.state);
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
    this.state.setSignupShip(newAuthShip);
    return {
      url,
      cookie,
      patp: parts[1],
      value: parts[2],
    };
  }

  async getProfile(_event: any, ship: string) {
    const { url, cookie, patp } = this.state.signupShip!;
    const ourProfile = await ContactApi.getContact(ship, {
      ship: patp,
      url,
      cookie: cookie!,
    });
    this.state.signupShip?.setContactMetadata({
      nickname: ourProfile.nickname,
      color: ourProfile.color,
      avatar: ourProfile.avatar,
    });
    return ourProfile;
  }

  async saveProfile(
    _event: any,
    ship: string,
    data: {
      nickname: string;
      color: string;
      avatar: string | null;
      [key: string]: any;
    }
  ) {
    const { url, cookie, patp } = this.state.signupShip!;
    const credentials = {
      ship: patp,
      url,
      cookie: cookie!,
    };
    const updatedProfile = await ContactApi.saveContact(
      ship,
      credentials,
      data
    );
    this.state.signupShip?.setContactMetadata({
      nickname: updatedProfile.nickname,
      color: updatedProfile.color,
      avatar: updatedProfile.avatar,
    });
    return updatedProfile;
  }

  async installRealm(_event: any, ship: string) {
    // TODO kiln-install realm desk
    console.log('installing realm on ', ship);
  }
  async completeSignup(_event: any): Promise<void> {
    const signupShip = clone(this.state.signupShip!);
    this.state.clearSignupShip();
    this.core.services.identity.auth.storeNewShip(signupShip);
    this.core.services.ship.storeNewShip(signupShip);
  }
}
