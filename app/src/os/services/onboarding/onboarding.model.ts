import {
  flow,
  Instance,
  types,
} from 'mobx-state-tree';
import { LoaderModel } from '../common.model';
import { HostingPlanet } from 'os/api/holium';

export enum OnboardingStep {
  DISCLAIMER = 'onboarding:disclaimer',
  HAVE_URBIT_ID = 'onboarding:have-urbit-id',

    ADD_SHIP = 'onboarding:add-ship',

    SELECT_PATP = 'onboarding:hosted:select-patp',
    SELECT_HOSTING_PLAN = 'onboarding:hosted:select-hosting-plan',
    PAYMENT = 'onboarding:hosted:payment',
    CONFIRMATION = 'onboarding:hosted:confirmation',

  CONNECTING_SHIP = 'onboarding:connecting-ship',
  PROFILE_SETUP = 'onboarding:profile-setup',
  SET_PASSWORD = 'onboarding:set-password',
  INSTALL_AGENT = 'onboarding:install-agent'
};

export const PlanetModel = types
  .model({
    patp: types.string,
    sigil: types.string,
    booted: types.boolean
  })

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
  }))

export const OnboardingStore = types
  .model({
    currentStep: OnboardingStep.DISCLAIMER,
    agreedToDisclaimer: false,
    selfHosted: false,
    planet: types.maybe(PlanetModel),
    ship: types.maybe(OnboardingShipModel),
    installer: types.optional(LoaderModel, { state: 'initial' }),
  })
  .actions((self) => ({

    setStep(step: OnboardingStep) {
      self.currentStep = step;
    },

    setAgreedToDisclaimer() {
      self.agreedToDisclaimer = true;
    },

    setSelfHosted(selfHosted: boolean) {
      self.selfHosted = selfHosted;
    },

    setPlanet(planet: HostingPlanet) {
      self.planet = PlanetModel.create(planet)
    },

    setShip: flow(function* (shipInfo: {
      patp: string;
      url: string;
      cookie: string;
    }) {
      self.ship = OnboardingShipModel.create({ ...shipInfo, id: `onboarding${shipInfo.patp}` });
    }),

    installRealm: flow(function* () {
      self.installer.set('loading');
      self.installer.set('loaded');
    }),

    reset() {
      self.ship = undefined;
      self.agreedToDisclaimer = false;
      self.currentStep = OnboardingStep.DISCLAIMER;
    }
  }));

export type OnboardingStoreType = Instance<typeof OnboardingStore>;
