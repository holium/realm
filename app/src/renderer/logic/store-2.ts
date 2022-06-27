import { LoaderModel } from '../../os/services/common.model';
import { createContext, useContext } from 'react';
import { onBoot } from './realm.core';

import {
  applyPatch,
  castToSnapshot,
  Instance,
  onSnapshot,
  applySnapshot,
  types,
} from 'mobx-state-tree';

// import { ConfigStore } from '../logic-old/stores/config';
import { ThemeStore } from '../logic-old/theme/store';
import { DesktopStore } from '../logic-old/desktop/store';
import { SpacesStore } from '../../os/services/spaces/models/spaces';
import { AuthStore } from '../../os/services/identity/auth.model';
import { SignupStore } from '../../os/services/identity/signup.model';
import { ShipModel } from '../../os/services/ship/models/ship';

export const Services = types
  .model('ServicesStore', {
    shell: types.model('ShellStore', {
      // preferenceStore: ConfigStore,
      theme: ThemeStore,
      desktop: DesktopStore,
    }),
    identity: types.model('identity', {
      auth: AuthStore,
      signup: SignupStore,
    }),
    ship: types.maybe(ShipModel),
    spaces: SpacesStore,
  })
  .actions((self) => ({
    setShip(ship: any) {
      self.ship = ship;
    },
    clearShip() {
      self.ship = undefined;
    },
  }));

const services = Services.create({
  shell: {
    // preferenceStore: {},
    theme: {},
    desktop: {},
  },
  identity: {
    auth: {
      loader: { state: 'initial' },
      firstTime: true,
    },
    signup: {
      loader: { state: 'initial' },
    },
  },
  ship: undefined,
  spaces: {
    loader: { state: 'initial' },
    spaces: undefined,
  },
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
    started: types.optional(types.boolean, false),
    booted: types.optional(types.boolean, false),
    onboarded: types.optional(types.boolean, false),
    loggedIn: types.optional(types.boolean, false),

    // services: types.map()
  })
  .actions((self) => ({
    setOnboarded() {
      self.onboarded = true;
    },
    start() {
      self.started = true;
    },
    setBooted() {
      // onBoot();
      self.booted = true;
    },
    login() {},
  }));

export const coreStore = CoreStore.create();

// After boot, set the initial data
onBoot().then((response: any) => {
  servicesStore.identity.auth.initialSync({
    key: 'ships',
    model: response.auth,
  });
  servicesStore.identity.signup.initialSync({
    key: 'ships',
    model: response.signup,
  });
  coreStore.setBooted();
});

// window.electron.os.booted((_event: any, data: any) => {
//   console.log('on-ready');

//   coreStore.setBooted();
// });

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

onSnapshot(coreStore, (snapshot) => {
  localStorage.setItem('coreStore', JSON.stringify(snapshot));
});

onSnapshot(servicesStore, (snapshot) => {
  localStorage.setItem('servicesStore', JSON.stringify(snapshot));
});

// Auth events
window.electron.os.auth.onLogout((_event: any) => {
  console.log('on log out event');
  servicesStore.clearShip();
});

// Effect events
window.electron.os.onEffect((_event: any, value: any) => {
  // if (value.response === 'diff') {
  //   console.log('got effect data => ', value.json);
  // }
  // console.log(value);
  if (value.response === 'patch') {
    if (value.resource === 'auth') {
      applyPatch(servicesStore.identity.auth, value.patch);
    }
    if (value.resource === 'signup') {
      applyPatch(servicesStore.identity.signup, value.patch);
    }
    if (value.resource === 'spaces') {
      applyPatch(servicesStore.spaces, value.patch);
    }
    if (value.resource === 'ship') {
      applyPatch(servicesStore.ship, value.patch);
    }
  }
  if (value.response === 'initial') {
    if (value.resource === 'ship') {
      servicesStore.setShip(ShipModel.create(value.model));
      servicesStore.shell.desktop.setIsBlurred(false);
    }
    if (value.resource === 'auth') {
      // authState.authStore.initialSync(value);
    }
    if (value.resource === 'theme') {
      // osState.theme.initialSync(value);
    }
    if (value.resource === 'spaces') {
      applySnapshot(servicesStore.spaces, castToSnapshot(value.model));
      // servicesStore.spaces.setInitial(value.model);
      // spacesState.syncPatches(value);
    }
  }
});

// window.electron.app.setFullscreen((_event: any, data: any) => {
//   // osState.desktop.setFullscreen(data);
// });

// window.electron.app.setAppviewPreload((_event: any, data: any) => {
//   // osState.desktop.setAppviewPreload(data);
// });
