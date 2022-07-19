import { ipcMain, ipcRenderer } from 'electron';
import Store from 'electron-store';
import {
  clone,
  onPatch,
  onSnapshot,
  getSnapshot,
  castToSnapshot,
} from 'mobx-state-tree';

import Realm from '../..';
import { BaseService } from '../base.service';
import { OnboardingStore, OnboardingStoreType, OnboardingStep } from './onboarding.model';
import { AuthShip } from '../identity/auth.model';
import { getCookie, ShipConnectionData } from '../../lib/shipHelpers';
import { ContactApi } from '../../api/contacts';
import { HostingPlanet } from 'os/api/holium';

export class OnboardingService extends BaseService {
  private db: Store<OnboardingStoreType>; // for persistance
  private state: OnboardingStoreType; // for state management

  handlers = {
    'realm.onboarding.setStep': this.setStep,
    'realm.onboarding.agreedToDisclaimer': this.agreedToDisclaimer,
    'realm.onboarding.selfHosted': this.setSelfHosted,
    'realm.onboarding.getAvailablePlanets': this.getAvailablePlanets,
    'realm.onboarding.addShip': this.addShip,
    'realm.onboarding.selectPlanet': this.selectPlanet,
    'realm.onboarding.getProfile': this.getProfile,
    'realm.onboarding.setProfile': this.setProfile,
    'realm.onboarding.setPassword': this.setPassword,
    'realm.onboarding.installRealm': this.installRealm,
    'realm.onboarding.completeOnboarding': this.completeOnboarding,
  }

  static preload = {
    setStep(step: OnboardingStep) {
      return ipcRenderer.invoke('realm.onboarding.setStep', step);
    },

    agreedToDisclaimer() {
      return ipcRenderer.invoke('realm.onboarding.agreedToDisclaimer');
    },

    setSelfHosted(selfHosted: boolean) {
      return ipcRenderer.invoke('realm.onboarding.selfHosted', selfHosted);
    },

    getAvailablePlanets() {
      return ipcRenderer.invoke('realm.onboarding.getAvailablePlanets');
    },

    addShip(shipInfo: ShipConnectionData) {
      return ipcRenderer.invoke('realm.onboarding.addShip', shipInfo);
    },

    selectPlanet(patp: HostingPlanet) {
      return ipcRenderer.invoke('realm.onboarding.selectPlanet', patp);
    },

    getProfile() {
      return ipcRenderer.invoke('realm.onboarding.getProfile');
    },

    setProfile(profileData: {
      nickname: string;
      color: string;
      avatar: string | null;
    }) {
      return ipcRenderer.invoke('realm.onboarding.setProfile', profileData);
    },

    setPassword(password: string) {
      return ipcRenderer.invoke('realm.onboarding.setPassword', password);
    },

    installRealm() {
      return ipcRenderer.invoke('realm.onboarding.installRealm');
    },

    completeOnboarding() {
      return ipcRenderer.invoke('realm.onboarding.completeOnboarding');
    }
  }

  constructor(core: Realm, options: any = {}) {
    super(core, options);

    this.db = new Store({
      name: `realm.onboarding`,
      accessPropertiesByDotNotation: true,
    });

    let persistedState: OnboardingStoreType = this.db.store;
    this.state = Object.keys(persistedState).length !== 0
      ? OnboardingStore.create(castToSnapshot(persistedState))
      : OnboardingStore.create();

    onSnapshot(this.state, (snapshot) => {
      this.db!.store = castToSnapshot(snapshot);
    });

    onPatch(this.state, (patch) => {
      const patchEffect = {
        patch,
        resource: 'onboarding',
        response: 'patch',
      };
      this.core.onEffect(patchEffect);
    });

    Object.keys(this.handlers).forEach((handlerName: any) => {
      // @ts-ignore
      ipcMain.handle(handlerName, this.handlers[handlerName].bind(this));
    });
  }

  get snapshot() {
    return this.state ? getSnapshot(this.state) : null;
  }

  reset() {
    this.state.reset();
  }

  setStep(_event: any, step: OnboardingStep) {
    this.state.setStep(step);
  }

  agreedToDisclaimer(_event: any) {
    this.state.setAgreedToDisclaimer();
  }

  setSelfHosted(_event: any, selfHosted: boolean) {
    this.state.setSelfHosted(selfHosted);

    if (!selfHosted) {
      // pre-fetch available planets
      this.core.holiumClient.getPlanets();
    }
  }

  async getAvailablePlanets() {
    return await this.core.holiumClient.getPlanets();
  }

  async addShip(
    _event: any,
    shipData: { patp: string; url: string; code: string }
  ) {
    try {
      let { patp, url } = shipData;
      let cookie = await getCookie(shipData);

      this.state.setShip({
        patp,
        cookie,
        url
      });

      return { url, cookie, patp };
    } catch (reason) {
      console.error('Failed to connect to ship', reason);
      throw new Error('Failed to connect to ship')
    }
  }

  async selectPlanet(_event: any, planet: HostingPlanet) {
    this.state.setPlanet(planet);
  }

  async getProfile(_event: any) {
    if (!this.state.ship)
      throw new Error('Cannot get profile, onboarding ship not set.')

    console.log('get profile', castToSnapshot(this.state.ship))

    const { url, cookie, patp } = this.state.ship;
    const ourProfile = await ContactApi.getContact(patp, {
      ship: patp,
      url,
      cookie: cookie!,
    });

    this.state.ship.setContactMetadata(ourProfile);
    return ourProfile;
  }


  async setProfile(
    _event: any,
    profileData: {
      nickname: string;
      color: string;
      avatar: string | null;
    }
  ) {
    console.log('setting profile', profileData)
    if (!this.state.ship)
      throw new Error('Cannot save profile, onboarding ship not set.');

    const { url, cookie, patp } = this.state.ship!;
    const credentials = {
      ship: patp,
      url,
      cookie: cookie!
    };

    console.log('creds', credentials)

    const updatedProfile = await ContactApi.saveContact(
      patp,
      credentials,
      profileData
    );

    this.state.ship.setContactMetadata(updatedProfile);

    return updatedProfile;
  }

  async setPassword(_event: any, password: string) {
    // TODO store password hash
    console.log('placeholder: saving password...')
  }

  async installRealm(_event: any, ship: string) {
    // TODO kiln-install realm desk
    console.log('placeholder: installing realm on ', ship);
    this.state.installRealm();
  }

  async completeOnboarding(_event: any) {
    if (!this.state.ship)
      throw new Error('Cannot complete onboarding, ship not set.');

    const ship = clone(this.state.ship);
    const authShip = AuthShip.create({ ...ship, id: `auth${ship.patp}`});

    this.core.services.identity.auth.storeNewShip(authShip);
    this.core.services.identity.auth.setFirstTime();
    this.core.services.ship.storeNewShip(authShip);
  }
}
