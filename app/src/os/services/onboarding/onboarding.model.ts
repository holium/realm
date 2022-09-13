import { flow, Instance, types } from 'mobx-state-tree';
import { LoaderModel } from '../common.model';
import { AccessCode, HostingPlanet } from 'os/api/holium';

export enum OnboardingStep {
  DISCLAIMER = 'onboarding:disclaimer',
  HAVE_URBIT_ID = 'onboarding:have-urbit-id',
  ADD_SHIP = 'onboarding:add-ship',
  ACCESS_CODE = 'onboarding:access-code',
  SELECT_PATP = 'onboarding:hosted:select-patp',
  SELECT_HOSTING_PLAN = 'onboarding:hosted:select-hosting-plan',
  STRIPE_PAYMENT = 'onboarding:hosted:stripe_payment',
  CONFIRMATION = 'onboarding:hosted:confirmation',
  CONNECTING_SHIP = 'onboarding:connecting-ship',
  PROFILE_SETUP = 'onboarding:profile-setup',
  SET_PASSWORD = 'onboarding:set-password',
  INSTALL_AGENT = 'onboarding:install-agent',
}

export const PlanetModel = types.model({
  patp: types.string,
  booted: types.boolean,
  priceMonthly: types.number,
  priceAnnual: types.number,
});

export const AccessCodeModel = types.model({
  id: types.string,
  value: types.maybeNull(types.string),
  redeemed: types.maybeNull(types.boolean),
  image: types.maybeNull(types.string),
  title: types.maybeNull(types.string),
  description: types.maybeNull(types.string),
  expiresAt: types.maybeNull(types.string),
});

export const OnboardingShipModel = types
  .model({
    url: types.string,
    id: types.identifier,
    patp: types.string,
    nickname: types.maybeNull(types.string),
    color: types.maybeNull(types.string),
    avatar: types.maybeNull(types.string),
    cookie: types.maybeNull(types.string),
  })
  .actions((self) => ({
    setContactMetadata: (contactMetadata: {
      color?: string;
      nickname?: string;
      avatar?: string;
    }) => {
      self.color = contactMetadata.color || '#000000';
      if (contactMetadata.nickname) self.nickname = contactMetadata.nickname;
      if (contactMetadata.avatar) self.avatar = contactMetadata.avatar;
    },
  }));

export const OnboardingStore = types
  .model({
    currentStep: OnboardingStep.DISCLAIMER,
    agreedToDisclaimer: false,
    seenSplash: types.optional(types.boolean, false),
    selfHosted: false,
    planet: types.maybe(PlanetModel),
    ship: types.maybe(OnboardingShipModel),
    installer: types.optional(LoaderModel, { state: 'initial' }),
    checkoutComplete: false,
    accessCode: types.maybe(AccessCodeModel),
    encryptedPassword: types.maybe(types.string),
  })
  .actions((self) => ({
    setStep(step: OnboardingStep) {
      self.currentStep = step;
    },
    setSeenSplash() {
      self.seenSplash = true;
    },

    setAgreedToDisclaimer() {
      self.agreedToDisclaimer = true;
    },

    setSelfHosted(selfHosted: boolean) {
      self.selfHosted = selfHosted;
    },

    setPlanet(planet: HostingPlanet) {
      self.planet = PlanetModel.create(planet);
    },

    setEncryptedPassword(passwordHash: string) {
      self.encryptedPassword = passwordHash;
    },

    setShip: flow(function* (shipInfo: {
      patp: string;
      url: string;
      cookie: string;
    }) {
      self.ship = OnboardingShipModel.create({
        ...shipInfo,
        id: `onboarding${shipInfo.patp}`,
      });
    }),

    setCheckoutComplete() {
      self.checkoutComplete = true;
    },

    setAccessCode(accessCode: AccessCode) {
      self.accessCode = AccessCodeModel.create(accessCode);
    },

    clearAccessCode() {
      self.accessCode = undefined;
    },

    beginRealmInstall() {
      self.installer.set('loading');
    },

    endRealmInstall() {
      self.installer.set('loaded');
    },

    installRealm: flow(function* () {
      self.installer.set('loading');
      self.installer.set('loaded');
    }),

    reset() {
      self.ship = undefined;
      self.accessCode = undefined;
      self.checkoutComplete = false;
      self.agreedToDisclaimer = false;
      self.planet = undefined;
      self.ship = undefined;
      self.encryptedPassword = undefined;
      self.currentStep = OnboardingStep.DISCLAIMER;
    },
  }));

export type OnboardingStoreType = Instance<typeof OnboardingStore>;
