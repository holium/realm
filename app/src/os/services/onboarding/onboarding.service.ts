import { ipcMain, ipcRenderer, IpcRendererEvent, safeStorage } from 'electron';
import Store from 'electron-store';
import {
  onPatch,
  onSnapshot,
  getSnapshot,
  castToSnapshot,
} from 'mobx-state-tree';
import bcrypt from 'bcryptjs';
import { Realm } from '../../index';
import { BaseService } from '../base.service';
import {
  OnboardingStore,
  OnboardingStoreType,
  OnboardingStep,
} from './onboarding.model';
import { AuthShip } from '../identity/auth.model';
import { getCookie, ShipConnectionData } from '../../lib/shipHelpers';
import { ContactApi } from '../../api/contacts';
import { FriendsApi } from '../../api/friends';
import { DocketApi } from '../../api/docket';
import { HostingPlanet, AccessCode } from 'os/api/holium';
import { Conduit } from '@holium/conduit';
import { toJS } from 'mobx';
import { RealmInstallationStatus } from '../../types';

export class OnboardingService extends BaseService {
  private readonly db: Store<OnboardingStoreType>; // for persistance
  private readonly state: OnboardingStoreType; // for state management
  private conduit?: Conduit;
  private dnsDelayTimestamp?: number;
  private stripeKey: string;

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
    'realm.onboarding.getShipCode': this.getShipCode,
    'realm.onboarding.checkShipBooted': this.checkShipBooted,
    'realm.onboarding.addShip': this.addShip,
    'realm.onboarding.selectPlanet': this.selectPlanet,
    'realm.onboarding.getProfile': this.getProfile,
    'realm.onboarding.setProfile': this.setProfile,
    'realm.onboarding.setPassword': this.setPassword,
    'realm.onboarding.installRealm': this.installRealm,
    'realm.onboarding.is-realm-fully-installed': this.isRealmFullyInstalled,
    'realm.onboarding.completeOnboarding': this.completeOnboarding,
    'realm.onboarding.exit': this.exit,
    'realm.onboarding.closeConduit': this.closeConduit,
    'realm.onboarding.confirmPlanetAvailable': this.confirmPlanetAvailable,
    'realm.onboarding.getStripeKey': this.getStripeKey,
    'realm.onboarding.pre-install-syscheck': this.preInstallSysCheck,
  };

  static preload = {
    async setStep(step: OnboardingStep) {
      return await ipcRenderer.invoke('realm.onboarding.setStep', step);
    },

    async agreedToDisclaimer() {
      return await ipcRenderer.invoke('realm.onboarding.agreedToDisclaimer');
    },

    async checkGatedAccess(code: string) {
      return await ipcRenderer.invoke(
        'realm.onboarding.checkGatedAccess',
        code
      );
    },

    async setEmail(
      email: string,
      isRecoveringAccount: boolean
    ): Promise<{ success: boolean; errorMessage: string }> {
      return await ipcRenderer.invoke(
        'realm.onboarding.setEmail',
        email,
        isRecoveringAccount
      );
    },

    async verifyEmail(verificationCode: string) {
      return await ipcRenderer.invoke(
        'realm.onboarding.verifyEmail',
        verificationCode
      );
    },

    async resendEmailConfirmation() {
      return await ipcRenderer.invoke(
        'realm.onboarding.resendEmailConfirmation'
      );
    },

    async setSeenSplash() {
      return await ipcRenderer.invoke('realm.onboarding.setSeenSplash');
    },

    async closeConduit() {
      return await ipcRenderer.invoke('realm.onboarding.closeConduit');
    },

    async setSelfHosted(selfHosted: boolean) {
      return await ipcRenderer.invoke(
        'realm.onboarding.selfHosted',
        selfHosted
      );
    },

    async getAvailablePlanets() {
      return await ipcRenderer.invoke('realm.onboarding.getAvailablePlanets');
    },

    async confirmPlanetStillAvailable() {
      return await ipcRenderer.invoke(
        'realm.onboarding.confirmPlanetAvailable'
      );
    },

    async getStripeKey() {
      return await ipcRenderer.invoke('realm.onboarding.getStripeKey');
    },

    preInstallSysCheck: () =>
      ipcRenderer.invoke('realm.onboarding.pre-install-syscheck'),
    async prepareCheckout(billingPeriod: string) {
      return await ipcRenderer.invoke(
        'realm.onboarding.prepareCheckout',
        billingPeriod
      );
    },

    async completeCheckout() {
      return await ipcRenderer.invoke('realm.onboarding.completeCheckout');
    },

    async getAccessCode(code: string) {
      return await ipcRenderer.invoke('realm.onboarding.getAccessCode', code);
    },

    async setAccessCode(accessCode: AccessCode) {
      return await ipcRenderer.invoke(
        'realm.onboarding.setAccessCode',
        accessCode
      );
    },

    async getShipCode() {
      return await ipcRenderer.invoke('realm.onboarding.getShipCode');
    },

    async checkShipBooted() {
      return await ipcRenderer.invoke('realm.onboarding.checkShipBooted');
    },

    async addShip(shipInfo: ShipConnectionData) {
      return await ipcRenderer.invoke('realm.onboarding.addShip', shipInfo);
    },

    async selectPlanet(patp: HostingPlanet) {
      return await ipcRenderer.invoke('realm.onboarding.selectPlanet', patp);
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

    async setPassword(password: string) {
      return await ipcRenderer.invoke('realm.onboarding.setPassword', password);
    },

    async isRealmFullyInstalled() {
      return await ipcRenderer.invoke('realm.onboarding.isRealmFullyInstalled');
    },

    async installRealm() {
      return await ipcRenderer.invoke('realm.onboarding.installRealm');
    },

    async completeOnboarding() {
      return await ipcRenderer.invoke('realm.onboarding.completeOnboarding');
    },

    async exitOnboarding() {
      return await ipcRenderer.invoke('realm.onboarding.exit');
    },

    onExit: (callback: any) =>
      ipcRenderer.on('realm.onboarding.on-exit', callback),
  };

  constructor(core: Realm, options: any = {}) {
    super(core, options);

    this.stripeKey =
      process.env.NODE_ENV === 'production'
        ? 'pk_live_51LJKtvHhoM3uGGuYMiFoGqOyPNViO8zlUwfHMsgtgPmkcTK3awIzix57nRgcr2lyCFrgJWeBz5HsSVxvIVz3aAA100KbdmBX9K'
        : 'pk_test_51LJKtvHhoM3uGGuYXzsCKctrpF6Lp9WAqRYEZbBQHxoccDHQLyrYSPt4bUOK6BbSkV5ogtYERCKVi7IAKmeXmYgU00Wv7Q9518';

    this.db = new Store({
      name: `realm.onboarding`,
      accessPropertiesByDotNotation: true,
    });

    const persistedState: OnboardingStoreType = this.db.store;
    this.state =
      Object.keys(persistedState).length !== 0
        ? OnboardingStore.create(castToSnapshot(persistedState))
        : OnboardingStore.create();

    onSnapshot(this.state, (snapshot) => {
      this.db.store = castToSnapshot(snapshot);
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
      // @ts-expect-error
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
    try {
      if (this.conduit !== undefined) {
        await this.closeConduit();
      }
      this.conduit = new Conduit();
      await this.conduit.init(url, patp.substring(1), cookie, code);
      return this.conduit;
    } catch (e) {
      throw new Error('Failed to connect to ship.');
    }
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

    try {
      const accessCode = await this.core.holiumClient.redeemAccessCode(code);
      if (accessCode && !accessCode.success) {
        switch (accessCode.errorCode) {
          case 473:
            return {
              success: false,
              message: 'This invite code has already been used.',
            };
          case 472:
            return { success: false, message: 'This invite code has expired.' };
          default:
            return { success: false, message: 'Invite code not found' };
        }
      }

      this.state.setInviteCode(code);
      if (accessCode.email) {
        this.state.setEmail(accessCode.email);
      }
      return { success: true, message: 'Access succeeded.' };
    } catch (e) {
      return {
        success: false,
        message: 'Something went wrong, please contact support@holium.com',
      };
    }
  }

  async setEmail(
    _event: any,
    email: string,
    isRecoveringAccount: boolean
  ): Promise<{ success: boolean; errorMessage: string }> {
    const { auth } = this.core.services.identity;
    this.state.setEmail(email);

    if (
      (process.env.NODE_ENV === 'development' && email === 'admin@admin.com') ||
      (process.env.DEBUG_PROD === 'true' && email === 'admin@admin.com')
    ) {
      auth.setAccountId('dev-admin');
      this.setStep(null, OnboardingStep.HAVE_URBIT_ID);
      return { success: true, errorMessage: '' };
    } else {
      let id = null,
        errorCode = null;
      const account = await this.core.holiumClient.findAccount(email);
      if (account?.id) {
        id = account.id;
        this.state.setNewAccount(false);
      }
      // if no account found and we are attempting to recover, this is an error condition
      else if (isRecoveringAccount) {
        return {
          success: false,
          errorMessage: `Account not found using email address '${email}`,
        };
      } else {
        const newAccount = await this.core.holiumClient.createAccount(
          email,
          this.state.inviteCode
        );
        id = newAccount.id;
        if (id) {
          this.state.setNewAccount(true);
        }
        errorCode = newAccount.errorCode;
      }
      if (!id) {
        const errorMessage =
          errorCode === 441
            ? 'An account with that email already exists.'
            : 'Something went wrong, please email us at support@holium.com';
        return { success: false, errorMessage };
      }
      auth.setAccountId(id);
      return { success: true, errorMessage: '' };
    }
  }

  async resendEmailVerification(_event: any) {
    const { auth } = this.core.services.identity;
    if (!auth.accountId)
      throw new Error('Accout must be set before resending verification code.');
    const success = await this.core.holiumClient.resendVerificationCode(
      auth.accountId
    );

    return success;
  }

  async verifyEmail(_event: any, verificationCode: string): Promise<boolean> {
    const { auth } = this.core.services.identity;
    if (!auth.accountId)
      throw new Error('Account must be set before verifying email.');

    const result = await this.core.holiumClient.verifyEmail(
      auth.accountId,
      verificationCode
    );
    return result.success;
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

    const planets = await this.core.holiumClient.getPlanets(
      auth.accountId,
      this.state.inviteCode
    );
    return planets;
  }

  async getAccessCode(
    _event: any,
    code: string
  ): Promise<{ invalid: boolean; accessCode: AccessCode | null }> {
    const accessCode = await this.core.holiumClient.getAccessCode(code);
    return { invalid: !accessCode, accessCode };
  }

  async preInstallSysCheck(_event: any) {
    const ship = this.state.ship;
    if (!ship) throw new Error('ship not set');
    const { url, patp } = ship;
    const session = this.core.getSession();
    if (!session) throw new Error('session not set');
    const { cookie, code } = session;
    if (!cookie) throw new Error('cookie not set');
    const tempConduit = await this.tempConduit(url, patp, cookie, code);
    this.state.preInstallSysCheck(tempConduit);
  }

  async prepareCheckout(_event: any, billingPeriod: string) {
    if (!['monthly', 'annual'].includes(billingPeriod))
      throw new Error('invalid billing period');

    const { auth } = this.core.services.identity;
    const { clientSecret } = await this.core.holiumClient.prepareCheckout(
      auth.accountId ?? '',
      this.state.planet?.patp ?? '',
      billingPeriod
    );
    auth.setClientSecret(clientSecret);
    return clientSecret;
  }

  async setAccessCode(_event: any, accessCode: AccessCode) {
    this.state.setAccessCode(accessCode);
  }

  async getShipCode(_event: any) {
    if (this.state.currentStep !== OnboardingStep.VIEW_CODE) {
      throw new Error('Cannot access code outside of view step.');
    }
    const session = this.core.getSession();
    return session?.code;
  }

  async getStripeKey(_event: any): Promise<string> {
    return this.stripeKey;
  }

  async confirmPlanetAvailable() {
    if (!this.state.planet) {
      throw new Error('Planet not set, cannot confirm available.');
    }

    const { auth } = this.core.services.identity;
    const patp = this.state.planet.patp;
    const stillAvailable = await this.core.holiumClient.confirmPlanetAvailable(
      auth.accountId ?? '',
      patp
    );

    if (!stillAvailable) {
      this.state.setPlanetWasTaken(true);
      this.setStep('_', OnboardingStep.SELECT_PATP);
    }
  }

  async completeCheckout(): Promise<{
    success: boolean;
    errorMessage?: string;
  }> {
    const { auth } = this.core.services.identity;
    const { success, errorCode } =
      await this.core.holiumClient.completeCheckout(
        auth.accountId ?? '',
        this.state.planet?.patp ?? ''
      );

    if (!success) {
      if (errorCode && errorCode === 407) {
        return {
          success: false,
          errorMessage:
            'Payment succeeded but your planet has already been taken. Please contact support@holium.com.',
        };
      } else if (errorCode && errorCode === 430) {
        return {
          success: false,
          errorMessage:
            'Payment succeeded but we were not able to boot your ship. Please contact support@holium.com',
        };
      }

      throw new Error('Unable to complete checkout,');
    }

    this.state.setCheckoutComplete();
    this.dnsDelayTimestamp = undefined;
    return { success: true };
  }

  async checkShipBooted(): Promise<boolean> {
    const { auth } = this.core.services.identity;
    const ships = await this.core.holiumClient.getShips(auth.accountId ?? '');
    const ship = ships.find((ship) => ship.patp === this.state.planet?.patp);

    if (!ship || !ship.code) return false;

    if (!this.dnsDelayTimestamp) {
      this.dnsDelayTimestamp = Date.now();
      return false;
    } else if (Date.now() - this.dnsDelayTimestamp < 1000 * 60 * 2) {
      // wait two minutes before trying to fetch
      return false;
    }

    const addShipResult = await this.addShip('_event', {
      patp: ship.patp,
      url: ship.link ?? '',
      code: ship.code,
    });

    if (!addShipResult.success) {
      return false;
    }

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
      const { patp, url, code } = shipData;
      const cookie = await getCookie({ patp, url, code });
      if (!cookie) throw new Error('Failed to get cookie');
      const cookiePatp = cookie.split('=')[0].replace('urbauth-', '');
      const sanitizedCookie = cookie.split('; ')[0];

      if (patp.toLowerCase() !== cookiePatp.toLowerCase()) {
        return {
          success: false,
          errorMessage: `Urbit ID does not match, did you mean ${cookiePatp}?`,
        };
      }
      // TODO this should be removed.
      this.core.saveSession({
        ship: patp,
        url,
        cookie: sanitizedCookie,
        code,
      });
      this.state.setShip({ patp, url });
      return { success: true, url, cookie, patp, code: sanitizedCookie };
    } catch (reason) {
      console.error('Failed to connect to ship', reason);
      return {
        success: false,
        errorMessage: `Failed to connect to ship: ${reason}`,
      };
    }
  }

  async selectPlanet(_event: any, planet: HostingPlanet) {
    this.state.setPlanet(planet);
  }

  async getProfile(_event: any) {
    const ship = this.state.ship;
    if (!ship) throw new Error('Ship not set, cannot get profile.');
    const { url, patp } = ship;
    const session = this.core.getSession();
    if (!session) throw new Error('Session not set, cannot get profile.');
    const { cookie, code } = session;
    if (!cookie) throw new Error('Cookie not set, cannot get profile.');

    const tempConduit = await this.tempConduit(url, patp, cookie, code);
    if (!this.state.ship)
      throw new Error('Cannot get profile, onboarding ship not set.');

    let ourProfile;
    try {
      ourProfile = await FriendsApi.getContact(tempConduit, patp);
    } catch (e) {
      try {
        ourProfile = await ContactApi.getContact(tempConduit, patp);
      } catch (e) {
        ourProfile = { color: '#000' };
      }
    }

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
    this.state.ship.setContactMetadata({
      ...profileData,
      avatar: profileData.avatar || undefined,
    });
    return profileData;
  }

  async setPassword(_event: any, password: string) {
    const encryptedPassword = safeStorage
      .encryptString(password)
      .toString('base64');
    this.state.setEncryptedPassword(encryptedPassword);
  }

  /**
   * This function will loop thru all configured (INSTALL_MOON environment variable)
   *   desks and determine the installed status of each.
   *
   * @param _event
   * @returns
   */
  async isRealmFullyInstalled(_event: any): Promise<RealmInstallationStatus> {
    let status: RealmInstallationStatus = {
      desks: undefined,
      installedDesks: undefined,
      result: 'success',
      errorMessage: undefined,
    };
    try {
      // if either INSTALL_MOON is undefined or set to 'bypass', ignore installation
      if (!process.env.INSTALL_MOON || process.env.INSTALL_MOON === 'bypass') {
        console.error(
          "error: [installRealm] - INSTALL_MOON not found or set to 'bypass'. skipping realm installation..."
        );
        status.errorMessage = `INSTALL_MOON not found or set to 'bypass'`;
        return status;
      }
      const parts: string[] = process.env.INSTALL_MOON.split(':');
      status.desks = parts[1].split(',');

      const ship = this.state.ship;
      if (!ship) throw new Error('Ship not set.');
      const { url, patp } = ship;
      const session = this.core.getSession();
      if (!session) throw new Error('Session not set.');
      const { cookie, code } = session;
      if (!cookie) throw new Error('Cookie not set.');
      const tempConduit = await this.tempConduit(url, patp, cookie, code);
      for (let idx = 0; idx < status.desks.length; idx++) {
        const desk = status.desks[idx];
        // check if the desk is already installed; if it is first unininstall it before
        const deskStatus = await DocketApi.getDeskStatus(
          tempConduit,
          patp,
          desk
        );
        // for now, if the app is currently installed; continue
        if (deskStatus === 'installed') {
          if (status.installedDesks === undefined) {
            status.installedDesks = [];
          }
          status.installedDesks.push(desk);
        }
      }
      if (status.desks.length === status.installedDesks?.length) {
        status.result = 'success';
      } else {
        status.result = 'partial';
      }
      await this.closeConduit();
    } catch (e) {
      status.result = 'error';
      status.errorMessage = `an error occurred determining Realm's installation status`;
    }
    return status;
  }

  async installRealm(_event: any) {
    // if either INSTALL_MOON is undefined or set to 'bypass', ignore installation
    if (!process.env.INSTALL_MOON || process.env.INSTALL_MOON === 'bypass') {
      console.error(
        "error: [installRealm] - INSTALL_MOON not found or set to 'bypass'. skipping realm installation..."
      );
      this.state.setRealmInstalled();
      return;
    }

    // force this back to initial; otherwise the UI will still think Realm is installed
    this.state.installer.set('initial');

    // INSTALL_MOON is a string of format <moon>:<desk>,<desk>,<desk>,...
    // example: INSTALL_MOON=~hostyv:realm,courier
    const parts: string[] = process.env.INSTALL_MOON.split(':');
    const moon: string = parts[0];
    const desks: string[] = parts[1].split(',');
    const ship = this.state.ship;
    if (!ship) throw new Error('Ship not set.');
    const { url, patp } = ship;
    const session = this.core.getSession();
    if (!session) throw new Error('Session not set.');
    const { cookie, code } = session;
    if (!cookie) throw new Error('Cookie not set.');
    const tempConduit = await this.tempConduit(url, patp, cookie, code);

    this.state.beginRealmInstall();
    for (let idx = 0; idx < desks.length; idx++) {
      const response: string = await DocketApi.installDesk(
        tempConduit,
        moon,
        desks[idx]
      );
      if (response !== 'success') {
        await this.closeConduit();
        this.state.endRealmInstall(response, response);
        return;
      }
    }
    await this.closeConduit();
    this.state.endRealmInstall('success');
    this.state.setRealmInstalled();
  }

  async completeOnboarding(_event: any) {
    if (!this.state.ship)
      throw new Error('Cannot complete onboarding, ship not set.');

    const decryptedPassword = safeStorage.decryptString(
      Buffer.from(this.state.encryptedPassword ?? '', 'base64')
    );
    this.core.passwords.setPassword(this.state.ship.patp, decryptedPassword);
    const passwordHash = await bcrypt.hash(decryptedPassword, 12);

    const ship = toJS(this.state.ship);
    const authShip = AuthShip.create({
      ...ship,
      id: `auth${ship.patp}`,
      passwordHash,
    });

    const { url, patp, nickname, color, avatar } = this.state.ship;
    const session = this.core.getSession();
    if (!session) throw new Error('Session not set.');
    const { cookie, code } = session;
    if (!cookie) throw new Error('Cookie not set.');
    const tempConduit = await this.tempConduit(url, patp, cookie, code);

    const profileData = {
      nickname,
      color,
      avatar,
    };

    await FriendsApi.saveContact(tempConduit, patp, profileData);

    this.core.saveSession({ ...session, cookie: null });

    this.core.services.identity.auth.storeCredentials(
      ship.patp,
      decryptedPassword,
      {
        code: session.code,
      }
    );

    this.core.services.identity.auth.storeNewShip(authShip);
    this.core.services.identity.auth.setEmail(this.state.email ?? '');
    this.core.services.identity.auth.setFirstTime();

    this.core.services.ship.storeNewShip(authShip);
    this.core.services.shell.closeDialog(null);
    this.state.cleanup();
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
