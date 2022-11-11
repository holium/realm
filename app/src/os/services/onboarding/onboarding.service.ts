import { ipcMain, ipcRenderer, safeStorage } from 'electron';
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
import {
  OnboardingStore,
  OnboardingStoreType,
  OnboardingStep,
} from './onboarding.model';
import { AuthShip } from '../identity/auth.model';
import { getCookie, ShipConnectionData } from '../../lib/shipHelpers';
import { ContactApi } from '../../api/contacts';
import { DocketApi } from '../../api/docket';
import { HostingPlanet, AccessCode } from 'os/api/holium';
import { Conduit } from '@holium/conduit';
import { toJS } from 'mobx';
import { storeCredentials } from '../../lib/shipHelpers';

export class OnboardingService extends BaseService {
  private db: Store<OnboardingStoreType>; // for persistance
  private state: OnboardingStoreType; // for state management
  private conduit?: Conduit;

  handlers = {
    'realm.onboarding.setStep': this.setStep,
    'realm.onboarding.setSeenSplash': this.setSeenSplash,
    'realm.onboarding.agreedToDisclaimer': this.agreedToDisclaimer,
    'realm.onboarding.checkGatedAccess': this.checkGatedAccess,
    'realm.onboarding.setEmail': this.setEmail,
    'realm.onboarding.verifyEmail': this.verifyEmail,
    'realm.onboarding.resendEmailConfirmation': this.resendEmailVerification,
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
    'realm.onboarding.exit': this.exit,
    'realm.onboarding.closeConduit': this.closeConduit,
  };

  static preload = {
    setStep(step: OnboardingStep) {
      return ipcRenderer.invoke('realm.onboarding.setStep', step);
    },

    agreedToDisclaimer() {
      return ipcRenderer.invoke('realm.onboarding.agreedToDisclaimer');
    },

    checkGatedAccess(code: string) {
      return ipcRenderer.invoke('realm.onboarding.checkGatedAccess', code);
    },

    setEmail(email: string) {
      return ipcRenderer.invoke('realm.onboarding.setEmail', email);
    },

    verifyEmail(verificationCode: string) {
      return ipcRenderer.invoke(
        'realm.onboarding.verifyEmail',
        verificationCode
      );
    },

    resendEmailConfirmation() {
      return ipcRenderer.invoke('realm.onboarding.resendEmailConfirmation');
    },

    setSeenSplash() {
      return ipcRenderer.invoke('realm.onboarding.setSeenSplash');
    },

    closeConduit() {
      return ipcRenderer.invoke('realm.onboarding.closeConduit');
    },

    setSelfHosted(selfHosted: boolean) {
      return ipcRenderer.invoke('realm.onboarding.selfHosted', selfHosted);
    },

    getAvailablePlanets() {
      return ipcRenderer.invoke('realm.onboarding.getAvailablePlanets');
    },

    prepareCheckout(billingPeriod: string) {
      return ipcRenderer.invoke(
        'realm.onboarding.prepareCheckout',
        billingPeriod
      );
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

    exitOnboarding() {
      return ipcRenderer.invoke('realm.onboarding.exit');
    },

    onExit: (callback: any) =>
      ipcRenderer.on('realm.onboarding.on-exit', callback),
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

    this.core.mainWindow.on('close', async () => {
      await this.conduit?.closeChannel();
      this.conduit = undefined;
    });
  }

  get snapshot() {
    return this.state ? getSnapshot(this.state) : null;
  }

  /**
   * Provides a clean conduit for onboarding pokes and scries
   *
   * @param url
   * @param patp
   * @param substring
   */
  async tempConduit(
    url: string,
    patp: string,
    cookie: string,
    code: string | undefined = undefined
  ) {
    if (this.conduit !== undefined) {
      await this.closeConduit();
    }
    this.conduit = new Conduit();
    await this.conduit.init(url, patp.substring(1), cookie!, code);
    return this.conduit;
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

  async checkGatedAccess(
    _event: any,
    code: string
  ): Promise<{ success: boolean; message: string }> {
    if (
      (process.env.NODE_ENV === 'development' &&
        code === '~admins-admins-admins') ||
      (process.env.DEBUG_PROD === 'true' && code === '~admins-admins-admins')
    ) {
      this.state.setInviteCode('~admins-admins-admins');
      return { success: true, message: 'Access succeeded.' };
    }

    let accessCode = await this.core.holiumClient.getAccessCode(code);
    if (accessCode && accessCode.type === 'ACCESS') {
      if (accessCode.singleUse && accessCode.redeemed) {
        return {
          success: false,
          message: 'This invite code was already redeemed.',
        };
      } else if (new Date(accessCode.expiresAt!).getTime() < Date.now()) {
        return { success: false, message: 'This invite code has expired.' };
      } else {
        this.state.setInviteCode(code);
        if (accessCode.email) {
          this.state.setEmail(accessCode.email);
        }
        return { success: true, message: 'Access succeeded.' };
      }
    } else {
      return { success: false, message: 'Invite code not found.' };
    }
  }

  async setEmail(_event: any, email: string) {
    console.log('trying to set email');
    const { auth } = this.core.services.identity;
    //let account = await this.core.holiumClient.createAccount(email);
    this.state.setEmail(email);
    //this.state.setVerificationCode(account.verificationCode);

    //auth.setAccountId(account.id);

    if (
      (process.env.NODE_ENV === 'development' && email === 'admin@admin.com') ||
      (process.env.DEBUG_PROD === 'true' && email === 'admin@admin.com')
    ) {
      this.setStep(null, OnboardingStep.HAVE_URBIT_ID);
    }
  }

  async resendEmailVerification(_event: any) {
    const { auth } = this.core.services.identity;
    if (!auth.accountId)
      throw new Error('Accout must be set before resending verification code.');

    let newVerificationCode =
      await this.core.holiumClient.resendVerificationCode(auth.accountId);
    this.state.setVerificationCode(newVerificationCode);

    return newVerificationCode;
  }

  verifyEmail(_event: any, verificationCode: string): boolean {
    if (!this.state.verificationCode)
      throw new Error('Verification code must be set before verifying.');

    let verified = this.state.verificationCode === verificationCode;
    if (verified) this.state.setVerificationCode(null);

    return verified;
  }

  setSeenSplash(_event: any) {
    this.state.setSeenSplash();
  }
  setSelfHosted(_event: any, selfHosted: boolean) {
    this.state.setSelfHosted(selfHosted);
  }

  async getAvailablePlanets() {
    const { auth } = this.core.services.identity;
    if (!auth.accountId)
      throw new Error('Accout must be set before getting available planets.');

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

  async prepareCheckout(_event: any, billingPeriod: string) {
    if (!['monthly', 'annual'].includes(billingPeriod))
      throw new Error('invalid billing period');

    const { auth } = this.core.services.identity;
    let { clientSecret } = await this.core.holiumClient.prepareCheckout(
      auth.accountId!,
      this.state.planet!.patp,
      billingPeriod
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
    if (!ship) return false;

    const session = this.core.getSession();

    await this.addShip('_event', {
      patp: ship.patp,
      url: ship.link!,
      code: session.code,
    });
    return true;
  }

  async addShip(
    _event: any,
    shipData: {
      patp: string;
      url: string;
      code: string;
    }
  ) {
    try {
      let { patp, url, code } = shipData;
      let cookie = await getCookie({ patp, url, code });
      const session = this.core.getSession();
      this.core.saveSession({ ...session, cookie, code });
      this.state.setShip({ patp, url });
      return { url, cookie, patp, code: code };
    } catch (reason) {
      console.error('Failed to connect to ship', reason);
      throw new Error('Failed to connect to ship');
    }
  }

  async selectPlanet(_event: any, planet: HostingPlanet) {
    this.state.setPlanet(planet);
  }

  async getProfile(_event: any) {
    const { url, patp } = this.state.ship!;
    const { cookie, code } = this.core.getSession();
    const tempConduit = await this.tempConduit(url, patp, cookie!, code);
    // await this.tempConduit.init(url, patp.substring(1), cookie!);

    if (!this.state.ship)
      throw new Error('Cannot get profile, onboarding ship not set.');

    const ourProfile = await ContactApi.getContact(tempConduit, patp);

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
    if (!this.state.ship)
      throw new Error('Cannot save profile, onboarding ship not set.');
    const { url, patp } = this.state.ship!;
    const { cookie, code } = this.core.getSession();
    const tempConduit = await this.tempConduit(url, patp, cookie!, code);

    try {
      const updatedProfile = await ContactApi.saveContact(
        tempConduit,
        patp,
        profileData
      );

      this.state.ship.setContactMetadata(updatedProfile);

      return updatedProfile;
    } catch (err) {
      console.error(err);
      throw new Error('Error updating profile');
    }
  }

  async setPassword(_event: any, password: string) {
    let encryptedPassword = safeStorage
      .encryptString(password)
      .toString('base64');
    this.state.setEncryptedPassword(encryptedPassword);
  }

  async installRealm(_event: any, ship: string) {
    // if either INSTALL_MOON is undefined or set to 'bypass', ignore installation
    if (!process.env.INSTALL_MOON || process.env.INSTALL_MOON === 'bypass') {
      console.error(
        "error: [installRealm] - INSTALL_MOON not found or set to 'bypass'. skipping realm installation..."
      );
      this.state.installRealm();
      return;
    }
    // INSTALL_MOON is a string of format <moon>:<desk>,<desk>,<desk>,...
    // example: INSTALL_MOON=~hostyv:realm,courier,wallet
    const parts: string[] = process.env.INSTALL_MOON.split(':');
    const moon: string = parts[0];
    const desks: string[] = parts[1].split(',');
    console.log('installing realm from %o...', process.env.INSTALL_MOON);
    const { url, patp } = this.state.ship!;
    const { cookie, code } = this.core.getSession();
    const tempConduit = await this.tempConduit(url, patp, cookie!, code);
    this.state.beginRealmInstall();
    for (let idx = 0; idx < desks.length; idx++) {
      const response: string = await DocketApi.installDesk(
        tempConduit,
        moon,
        desks[idx]
      );
      console.log(`installDesk (await) => ${response}`);
      if (response !== 'success') {
        await this.closeConduit();
        this.state.endRealmInstall(response, response);
        return;
      }
    }
    await this.closeConduit();
    this.state.endRealmInstall('success');
    console.log('realm installation complete.');
    this.state.installRealm();
  }

  async completeOnboarding(_event: any) {
    if (!this.state.ship)
      throw new Error('Cannot complete onboarding, ship not set.');
    if (process.env.NODE_ENV !== 'development') {
      try {
        await this.core.holiumClient.redeemAccessCode(this.state.inviteCode!);
      } catch (e) {
        console.error('Unable to redeem gated access code, continuing anyway.');
      }
    }

    let decryptedPassword = safeStorage.decryptString(
      Buffer.from(this.state.encryptedPassword!, 'base64')
    );
    this.core.passwords.setPassword(this.state.ship.patp, decryptedPassword);
    let passwordHash = await bcrypt.hash(decryptedPassword, 12);

    const ship = toJS(this.state.ship);
    const authShip = AuthShip.create({
      ...ship,
      id: `auth${ship.patp}`,
    });

    const session = this.core.getSession();
    this.core.services.identity.auth.storeCredentials(
      ship.patp,
      decryptedPassword,
      {
        code: session.code,
        passwordHash,
      }
    );
    this.core.services.identity.auth.storeNewShip(authShip);
    this.core.services.identity.auth.setFirstTime();
    this.core.services.ship.storeNewShip(authShip);
    this.core.services.shell.closeDialog(null);

    await this.exit();
  }

  async closeConduit() {
    // Close onboarding conduit
    await this.conduit?.closeChannel();
    this.conduit = undefined;
  }

  async exit(_event?: any) {
    await this.closeConduit();
    this.core.mainWindow.webContents.send('realm.onboarding.on-exit');
  }
}
