import { AuthActions } from './actions/auth';
import { createContext, useContext } from 'react';
import {
  applyPatch,
  castToSnapshot,
  Instance,
  onSnapshot,
  applySnapshot,
  types,
} from 'mobx-state-tree';

import { DesktopStore } from 'os/services/shell/desktop.model';
import { ShellStore } from 'os/services/shell/shell.model';
import { SpacesStore } from 'os/services/spaces/models/spaces';
import { BazaarStore } from 'os/services/spaces/models/bazaar';
import { AuthStore } from 'os/services/identity/auth.model';
import { OnboardingStore } from 'os/services/onboarding/onboarding.model';
import { ShipModel, ShipModelType } from 'os/services/ship/models/ship';
import { ShellActions } from './actions/shell';
import { MembershipStore } from 'os/services/spaces/models/members';
import { SoundActions } from './actions/sound';
import { LoaderModel } from 'os/services/common.model';
import { OSActions } from './actions/os';
import { DocketStore } from 'os/services/ship/models/docket';
import { ChatStore } from 'os/services/ship/models/dms';
import { ContactStore } from 'os/services/ship/models/contacts';
import { ShipModels } from 'os/services/ship/ship.service';
import { FriendsStore } from 'os/services/ship/models/friends';
import { CourierStore } from 'os/services/ship/models/courier';

const loadSnapshot = (serviceKey: string) => {
  const localStore = localStorage.getItem('servicesStore');
  if (localStore) return JSON.parse(localStore)[serviceKey];
  return {};
};

export const Services = types
  .model('ServicesStore', {
    desktop: DesktopStore,
    shell: ShellStore,
    identity: types.model('identity', {
      auth: AuthStore,
    }),
    onboarding: OnboardingStore,
    ship: types.maybe(ShipModel),
    spaces: SpacesStore,
    bazaar: BazaarStore,
    membership: MembershipStore,
    docket: DocketStore,
    dms: ChatStore,
    courier: CourierStore,
    contacts: ContactStore,
    friends: FriendsStore,
  })
  .actions((self) => ({
    setShip(ship: any) {
      self.ship = ship;
    },
    clearShip() {
      self.ship = undefined;
    },
  }));

const desktopSnapshot = loadSnapshot('desktop');
const shellSnapshot = loadSnapshot('shell');
const bazaarSnapshot = loadSnapshot('bazaar');

const services = Services.create({
  desktop: desktopSnapshot || {},
  shell: shellSnapshot || {},
  identity: {
    auth: {
      loader: { state: 'initial' },
      firstTime: true,
    },
  },
  onboarding: {},
  ship: undefined,
  spaces: {
    loader: { state: 'initial' },
    spaces: undefined,
  },
  bazaar: bazaarSnapshot || {},
  membership: {},
  docket: {},
  dms: {},
  courier: {},
  contacts: { ourPatp: '' },
  friends: {},
});

export const servicesStore = services;

// -------------------------------
// Create core context
// -------------------------------
export type ServiceInstance = Instance<typeof Services>;
const ServicesContext = createContext<null | ServiceInstance>(services);

export const ServiceProvider = ServicesContext.Provider;
export function useServices() {
  const store = useContext(ServicesContext);
  if (store === null) {
    throw new Error('Store cannot be null, please add a context provider');
  }
  return store;
}

export const CoreStore = types
  .model({
    loader: types.optional(LoaderModel, { state: 'initial' }),
    booted: types.optional(types.boolean, false),
    resuming: types.optional(types.boolean, false),
    onboarded: types.optional(types.boolean, false),
    loggedIn: types.optional(types.boolean, false),
  })
  .actions((self) => ({
    setOnboarded() {
      self.onboarded = true;
    },
    setResuming(isResuming: boolean) {
      self.resuming = isResuming;
    },
    setBooted() {
      self.booted = true;
    },
    setLoggedIn(isLoggedIn: boolean) {
      self.loggedIn = isLoggedIn;
    },
    reset() {
      self.booted = false;
    },
    login() {},
  }));

export const coreStore = CoreStore.create();
coreStore.reset(); // need to reset coreStore for proper boot sequence
coreStore.setResuming(true); // need to start the renderer with resuming

OSActions.boot();

OSActions.onBoot((_event: any, response: any) => {
  // console.log('onBoot');
  servicesStore.identity.auth.initialSync({
    key: 'ships',
    model: response.auth,
  });
  if (response.auth.firstTime) {
    SoundActions.playStartup();
  }
  if (response.models && response.ship) {
    applySnapshot(
      servicesStore.contacts,
      castToSnapshot(response.models.contacts!)
    );
    applySnapshot(
      servicesStore.friends,
      castToSnapshot(response.models.friends)
    );
    applySnapshot(
      servicesStore.courier,
      castToSnapshot(response.models.courier!)
    );
    applySnapshot(servicesStore.docket, castToSnapshot(response.models.docket));
    applySnapshot(servicesStore.dms, castToSnapshot(response.models.chat!));
  }
  if (response.ship) {
    servicesStore.setShip(ShipModel.create(response.ship));
    coreStore.setLoggedIn(true);
    ShellActions.setBlur(false);
  }
  if (response.onboarding) {
    applySnapshot(
      servicesStore.onboarding,
      castToSnapshot(response.onboarding)
    );
  }
  if (response.spaces) {
    applySnapshot(servicesStore.spaces, castToSnapshot(response.spaces));
  }
  if (response.loggedIn) {
    coreStore.setLoggedIn(true);
  }
  if (response.membership) {
    applySnapshot(servicesStore.membership, response.membership);
  }
  if (response.bazaar) {
    applySnapshot(servicesStore.bazaar, response.bazaar);
  }
  // console.log(response.ship)
  if (!response.ship) {
    // if we haven't logged in, set false for auth page
    coreStore.setResuming(false);
  } else {
    // if we have logged in, set false only if the ship has loaded
    if (response.ship.loader.state === 'loaded') {
      coreStore.setResuming(false);
    }
  }
  coreStore.setBooted();
});

// -------------------------------
// Create core context
// -------------------------------
export type CoreInstance = Instance<typeof CoreStore>;
const CoreStateContext = createContext<null | CoreInstance>(coreStore);

export const CoreProvider = CoreStateContext.Provider;
export function useCore() {
  const store = useContext(CoreStateContext);
  if (store === null) {
    throw new Error('Store cannot be null, please add a context provider');
  }
  return store;
}

onSnapshot(servicesStore, (snapshot) => {
  localStorage.setItem('servicesStore', JSON.stringify(snapshot));
});

OSActions.onLogin((_event: any) => {
  SoundActions.playLogin();
});

OSActions.onConnected(
  (_event: any, initials: { ship: ShipModelType; models: ShipModels }) => {
    applySnapshot(
      servicesStore.courier,
      castToSnapshot(initials.models.courier!)
    );
    applySnapshot(
      servicesStore.contacts,
      castToSnapshot(initials.models.contacts!)
    );
    applySnapshot(
      servicesStore.friends,
      castToSnapshot(initials.models.friends)
    );
    applySnapshot(servicesStore.docket, castToSnapshot(initials.models.docket));
    applySnapshot(servicesStore.dms, castToSnapshot(initials.models.chat!));

    servicesStore.setShip(ShipModel.create(initials.ship));

    coreStore.setLoggedIn(true);
    ShellActions.setBlur(false);
    coreStore.setResuming(false);
  }
);

// Auth events
OSActions.onLogout((_event: any) => {
  coreStore.setLoggedIn(false);
  servicesStore.clearShip();
  ShellActions.setBlur(true);
  SoundActions.playLogout();
});

// --------------------------------------
// ---------- Effects listener ----------
// --------------------------------------
// Effect events
OSActions.onEffect((_event: any, value: any) => {
  if (value.response === 'patch') {
    if (value.resource === 'auth') {
      applyPatch(servicesStore.identity.auth, value.patch);
    }
    if (value.resource === 'bazaar') {
      applyPatch(servicesStore.bazaar, value.patch);
    }
    if (value.resource === 'onboarding') {
      applyPatch(servicesStore.onboarding, value.patch);
    }
    if (value.resource === 'spaces') {
      applyPatch(servicesStore.spaces, value.patch);
    }
    if (value.resource === 'ship') {
      applyPatch(servicesStore.ship, value.patch);
    }
    if (value.resource === 'desktop') {
      applyPatch(servicesStore.desktop, value.patch);
    }
    if (value.resource === 'shell') {
      applyPatch(servicesStore.shell, value.patch);
    }
    if (value.resource === 'membership') {
      applyPatch(servicesStore.membership, value.patch);
    }
    if (value.resource === 'docket') {
      applyPatch(servicesStore.docket, value.patch);
    }
    if (value.resource === 'contacts') {
      applyPatch(servicesStore.contacts, value.patch);
    }
    if (value.resource === 'dms') {
      applyPatch(servicesStore.dms, value.patch);
    }
    if (value.resource === 'courier') {
      applyPatch(servicesStore.courier, value.patch);
    }
  }

  if (value.response === 'initial') {
    if (value.resource === 'courier') {
      applySnapshot(servicesStore.courier, value.model);
    }
    if (value.resource === 'ship') {
      servicesStore.setShip(ShipModel.create(value.model));
    }
    if (value.resource === 'auth') {
      // authState.authStore.initialSync(value);
    }
    if (value.resource === 'theme') {
      // osState.theme.initialSync(value);
    }
    if (value.resource === 'spaces') {
      applySnapshot(servicesStore.bazaar, castToSnapshot(value.model.bazaar));
      applySnapshot(servicesStore.spaces, castToSnapshot(value.model.spaces));
      applySnapshot(
        servicesStore.membership,
        castToSnapshot(value.model.membership)
      );
      applySnapshot(servicesStore.bazaar, castToSnapshot(value.model.bazaar));
    }
  }
});

window.electron.app.setAppviewPreload((_event: any, data: any) => {
  servicesStore.desktop.setAppviewPreload(data);
});
