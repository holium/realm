import { ipcMain, ipcRenderer, safeStorage } from 'electron';
import Store from 'electron-store';
import {
  clone,
  onPatch,
  onSnapshot,
  getSnapshot,
  castToSnapshot,
} from 'mobx-state-tree';
import bcrypt from 'bcryptjs';
import Realm from '../..';
import { BaseService } from '../base.service';
import {
  OnboardingStore,
  OnboardingStoreType,
  OnboardingStep,
} from './onboarding.model';
import { AuthShip } from '../identity/auth.model';
import { getCookie, ShipConnectionData } from '../../lib/shipHelpers';
import { ContactApi } from '../../api/contacts';
import { HostingPlanet, AccessCode } from 'os/api/holium';

export class OnboardingService extends BaseService {
  private db: Store<OnboardingStoreType>; // for persistance
  private state: OnboardingStoreType; // for state management

  handlers = {
    'realm.onboarding.setStep': this.setStep,
    'realm.onboarding.agreedToDisclaimer': this.agreedToDisclaimer,
    'realm.onboarding.selfHosted': this.setSelfHosted,
    'realm.onboarding.getAvailablePlanets': this.getAvailablePlanets,
    'realm.onboarding.prepareCheckout': this.prepareCheckout,
    'realm.onboarding.completeCheckout': this.completeCheckout,
    'realm.onboarding.getAccessCode': this.getAccessCode,
    'realm.onboarding.setAccessCode': this.setAccessCode,
    'realm.onboarding.checkShipBooted': this.checkShipBooted,
    'realm.onboarding.addShip': this.addShip,
    'realm.onboarding.selectPlanet': this.selectPlanet,
    'realm.onboarding.getProfile': this.getProfile,
    'realm.onboarding.setProfile': this.setProfile,
    'realm.onboarding.setPassword': this.setPassword,
    'realm.onboarding.installRealm': this.installRealm,
    'realm.onboarding.completeOnboarding': this.completeOnboarding,
  };

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

    prepareCheckout(tier: string) {
      return ipcRenderer.invoke('realm.onboarding.prepareCheckout', tier);
    },

    completeCheckout() {
      return ipcRenderer.invoke('realm.onboarding.completeCheckout');
    },

    getAccessCode(code: string) {
      return ipcRenderer.invoke('realm.onboarding.getAccessCode', code);
    },

    setAccessCode(accessCode: AccessCode) {
      return ipcRenderer.invoke('realm.onboarding.setAccessCode', accessCode);
    },

    checkShipBooted() {
      return ipcRenderer.invoke('realm.onboarding.checkShipBooted');
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
    },
  };

  constructor(core: Realm, options: any = {}) {
    super(core, options);

    this.db = new Store({
      name: `realm.onboarding`,
      accessPropertiesByDotNotation: true,
    });

    let persistedState: OnboardingStoreType = this.db.store;
    this.state =
      Object.keys(persistedState).length !== 0
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
    this.core.services.shell.nextDialog('_event', step);
  }

  agreedToDisclaimer(_event: any) {
    this.state.setAgreedToDisclaimer();
  }

  setSelfHosted(_event: any, selfHosted: boolean) {
    this.state.setSelfHosted(selfHosted);
  }

  async getAvailablePlanets() {
    const { auth } = this.core.services.identity;
    if (!auth.accountId) {
      let account = await this.core.holiumClient.createAccount();
      auth.setAccountId(account.id);
      return account.planets;
    }

    let planets = await this.core.holiumClient.getPlanets(
      auth.accountId,
      this.state.accessCode?.id
    );
    return planets;
  }

  async getAccessCode(
    _event: any,
    code: string
  ): Promise<{ invalid: boolean; accessCode: AccessCode | null }> {
    let accessCode = await this.core.holiumClient.getAccessCode(code);
    return { invalid: accessCode ? false : true, accessCode };
  }

  async prepareCheckout(_event: any, tier: string) {
    if (!['monthly', 'yearly'].includes(tier))
      throw new Error('invalid subscription tier');

    const { auth } = this.core.services.identity;
    let { clientSecret } = await this.core.holiumClient.prepareCheckout(
      auth.accountId!,
      this.state.planet!.patp,
      tier
    );
    auth.setClientSecret(clientSecret);
    return clientSecret;
  }

  async setAccessCode(_event: any, accessCode: AccessCode) {
    this.state.setAccessCode(accessCode);
  }

  async completeCheckout() {
    const { auth } = this.core.services.identity;
    let { checkoutComplete } = await this.core.holiumClient.completeCheckout(
      auth.accountId!,
      this.state.planet!.patp
    );

    if (!checkoutComplete) {
      throw new Error('Unable to complete checkout.');
    }

    this.state.setCheckoutComplete();
    return true;
  }

  async checkShipBooted(): Promise<boolean> {
    const { auth } = this.core.services.identity;
    let ships = await this.core.holiumClient.getShips(auth.accountId!);
    let ship = ships.find((ship) => ship.patp === this.state.planet!.patp);

    if (!ship?.code) {
      return false;
    }

    await this.addShip('_event', {
      patp: ship.patp,
      url: ship.link!,
      code: ship.code,
    });
    return true;
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
        url,
      });

      return { url, cookie, patp };
    } catch (reason) {
      console.error('Failed to connect to ship', reason);
      throw new Error('Failed to connect to ship');
    }
  }

  async selectPlanet(_event: any, planet: HostingPlanet) {
    this.state.setPlanet(planet);
  }

  async getProfile(_event: any) {
    if (!this.state.ship)
      throw new Error('Cannot get profile, onboarding ship not set.');

    console.log('get profile', castToSnapshot(this.state.ship));

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
    console.log('setting profile', profileData);
    if (!this.state.ship)
      throw new Error('Cannot save profile, onboarding ship not set.');

    const { url, cookie, patp } = this.state.ship!;
    const credentials = {
      ship: patp,
      url,
      cookie: cookie!,
    };

    console.log('creds', credentials);

    const updatedProfile = await ContactApi.saveContact(
      patp,
      credentials,
      profileData
    );

    this.state.ship.setContactMetadata(updatedProfile);

    return updatedProfile;
  }

  async setPassword(_event: any, password: string) {
    let encryptedPassword = safeStorage.encryptString(password).toString('base64');
    this.state.setEncryptedPassword(encryptedPassword);
  }

  async installRealm(_event: any, ship: string) {
    // TODO kiln-install realm desk
    console.log('placeholder: installing realm on ', ship);
    this.state.installRealm();
  }

  async completeOnboarding(_event: any) {
    if (!this.state.ship)
      throw new Error('Cannot complete onboarding, ship not set.');

    let decryptedPassword = safeStorage.decryptString(Buffer.from(this.state.encryptedPassword!, 'base64'));
    this.core.passwords.setPassword(this.state.ship.patp, decryptedPassword);
    let passwordHash = await bcrypt.hash(decryptedPassword, 12);

    const ship = clone(this.state.ship);
    const authShip = AuthShip.create({ ...ship, id: `auth${ship.patp}`, passwordHash });

    this.core.services.identity.auth.storeNewShip(authShip);
    this.core.services.identity.auth.setFirstTime();
    this.core.services.ship.storeNewShip(authShip);
    this.core.services.shell.closeDialog(null);
  }
}
