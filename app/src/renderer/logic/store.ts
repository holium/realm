import { createContext, useContext } from 'react';
import {
  applyPatch,
  castToSnapshot,
  Instance,
  applySnapshot,
  types,
} from 'mobx-state-tree';
import { DesktopStore } from 'os/services/shell/desktop.model';
import { ShellStore } from 'os/services/shell/shell.model';
import { SpacesStore } from 'os/services/spaces/models/spaces';
import { NewBazaarStore } from 'os/services/spaces/models/bazaar';
import { AuthStore } from 'os/services/identity/auth.model';
import { OnboardingStore } from 'os/services/onboarding/onboarding.model';
import { ShipModel, ShipModelType } from 'os/services/ship/models/ship';
import { ShellActions } from './actions/shell';
import { DesktopActions } from './actions/desktop';
import { MembershipStore } from 'os/services/spaces/models/members';
import { SoundActions } from './actions/sound';
import { LoaderModel } from 'os/services/common.model';
import { OSActions } from './actions/os';
import { ShipModels } from 'os/services/ship/ship.service';
import { FriendsStore } from 'os/services/ship/models/friends';
import { CourierStore } from 'os/services/ship/models/courier';
// import { NotificationStore } from 'os/services/ship/models/notifications';
import {
  NotificationStore,
  NotificationStoreType,
} from 'os/services/spaces/models/beacon';
// import { LiveRoom } from 'renderer/apps/store';
import { VisaModel } from 'os/services/spaces/models/visas';
import { ThemeStore } from './theme';
import { rgba } from 'polished';
import { watchOnlineStatus } from './lib/offline';
import { BulletinStore } from 'os/services/spaces/models/bulletin';
import { AirliftStore } from 'os/services/shell/airlift.model';

const Services = types
  .model('ServicesStore', {
    desktop: DesktopStore,
    shell: ShellStore,
    identity: types.model('identity', {
      auth: AuthStore,
    }),
    theme: ThemeStore,
    onboarding: OnboardingStore,
    ship: types.maybe(ShipModel),
    spaces: SpacesStore,
    bazaar: NewBazaarStore,
    membership: MembershipStore,
    visas: VisaModel,
    // docket: DocketStore,
    courier: CourierStore,
    friends: FriendsStore,
    beacon: NotificationStore,
    airlift: AirliftStore,
    bulletin: BulletinStore,
  })
  .actions((self) => ({
    setShip(ship: any) {
      self.ship = ship;
    },
    clearShip() {
      self.ship = undefined;
    },
    clearAll() {
      self.spaces = castToSnapshot({
        loader: { state: 'initial' },
        join: { state: 'initial' },
        spaces: undefined,
      });
      self.bazaar = castToSnapshot({});
      self.membership = castToSnapshot({});
      self.courier = castToSnapshot({});
      self.friends = castToSnapshot({});
      self.beacon = castToSnapshot({});
      self.visas = castToSnapshot({
        incoming: {},
        outgoing: {},
      });
    },
  }));

// const desktopSnapshot = loadSnapshot('desktop');
// const shellSnapshot = loadSnapshot('shell');

const services = Services.create({
  desktop: {},
  theme: {
    currentTheme: 'default',
    themes: {
      default: {
        id: 'default',
        backgroundColor: '#c4c3bf',
        accentColor: '#4E9EFD',
        inputColor: '#FFFFFF',
        dockColor: '#F5F5F4',
        windowColor: '#f5f5f4',
        mode: 'light',
        textColor: '#2a2927',
        iconColor: rgba('#333333', 0.6),
        mouseColor: '#4E9EFD',
        wallpaper:
          'https://images.unsplash.com/photo-1622547748225-3fc4abd2cca0?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2832&q=100',
      },
    },
  },
  shell: {},
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
    join: { state: 'initial' },
    spaces: undefined,
  },
  bazaar: {},
  membership: {},
  visas: {
    incoming: {},
    outgoing: {},
  },
  courier: {},
  friends: {},
  beacon: { notes: {} },
  bulletin: {},
  airlift: {},
});

export const servicesStore = services;

// -------------------------------
// Create core context
// -------------------------------
type ServiceInstance = Instance<typeof Services>;
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
    online: types.boolean,
    connectionStatus: types.enumeration([
      'connecting',
      'initialized',
      'connected',
      'offline',
      'failed',
      'stale',
      'refreshing',
      'refreshed',
    ]),
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
    setConnectionStatus(status: any) {
      self.connectionStatus = status;
      localStorage.setItem('connection-status', status);
    },
    setBooted() {
      self.booted = true;
    },
    setLoggedIn(isLoggedIn: boolean) {
      self.loggedIn = isLoggedIn;
    },
    setOnline(isOnline: boolean) {
      self.online = isOnline;
    },
    reset() {
      self.booted = false;
    },
    login() {},
  }));

export const coreStore = CoreStore.create({
  online: navigator.onLine,
  connectionStatus:
    (localStorage.getItem('connection-status') as any) || 'offline',
});

coreStore.reset(); // need to reset coreStore for proper boot sequence
coreStore.setResuming(true); // need to start the renderer with resuming
watchOnlineStatus(coreStore);
OSActions.onConnectionStatus((_event: any, status: any) => {
  coreStore.setConnectionStatus(status);
});

OSActions.boot();

OSActions.onLog((_event: any, data: any) => {
  console.log(data);
});

OSActions.onSetTheme((_event: any, data: any) => {
  // console.log('onSetTheme', data);
  servicesStore.theme.setCurrentTheme(data);
});

OSActions.onBoot((_event: any, response: any) => {
  applySnapshot(servicesStore.shell, castToSnapshot(response.shell));
  applySnapshot(servicesStore.desktop, castToSnapshot(response.desktop));
  // console.log('onBoot', response);
  servicesStore.identity.auth.initialSync({
    key: 'ships',
    model: response.auth,
  });

  if (response.models && response.ship) {
    applySnapshot(
      servicesStore.friends,
      castToSnapshot(response.models.friends)
    );
    if (response.models.courier) {
      applySnapshot(
        servicesStore.courier,
        castToSnapshot(response.models.courier)
      );
    }
  }
  if (response.ship) {
    servicesStore.setShip(ShipModel.create(response.ship));
    const shipColor = response.ship.color;
    if (shipColor) DesktopActions.setMouseColor(shipColor);
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
    applySnapshot(servicesStore.visas, castToSnapshot(response.visas));
    // console.log(res);
    if (servicesStore.spaces.selected) {
      const selected = servicesStore.spaces.selected;
      const bootTheme: any = {
        ...selected.theme,
        id: selected.path,
      };
      servicesStore.theme.setCurrentTheme(bootTheme);
    }
  }
  if (response.airlift) {
    applySnapshot(servicesStore.airlift, response.airlift);
  }
  if (response.bulletin) {
    applySnapshot(servicesStore.bulletin, response.bulletin);
  }
  if (response.bazaar) {
    applySnapshot(servicesStore.bazaar, response.bazaar);
  }
  if (response.beacon) {
    applySnapshot(servicesStore.beacon, response.beacon);
  }

  if (response.loggedIn) {
    coreStore.setLoggedIn(true);
  }
  if (response.membership) {
    applySnapshot(servicesStore.membership, response.membership);
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

OSActions.onLogin((_event: any) => {
  SoundActions.playLogin();
  const shipColor = servicesStore.desktop.mouseColor;
  if (shipColor) DesktopActions.setMouseColor(shipColor);
});

OSActions.onConnected(
  (
    _event: any,
    initials: {
      ship: ShipModelType;
      models: ShipModels;
      beacon: NotificationStoreType;
    }
  ) => {
    if (initials.models.courier) {
      applySnapshot(
        servicesStore.courier,
        castToSnapshot(initials.models.courier)
      );
    }
    applySnapshot(
      servicesStore.friends,
      castToSnapshot(initials.models.friends)
    );
    applySnapshot(servicesStore.beacon, castToSnapshot(initials.beacon));
    servicesStore.setShip(ShipModel.create(initials.ship));

    coreStore.setLoggedIn(true);
    ShellActions.setBlur(false);
    coreStore.setResuming(false);
  }
);

// Auth events
OSActions.onLogout((_event: any) => {
  // RoomsActions.exitRoom();
  // LiveRoom.leave();
  SoundActions.playLogout();
  servicesStore.clearAll();
  servicesStore.clearShip();
  coreStore.setLoggedIn(false);
  ShellActions.setBlur(true);
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
    if (value.resource === 'beacon') {
      applyPatch(servicesStore.beacon, value.patch);
    }
    if (value.resource === 'bulletin') {
      applyPatch(servicesStore.bulletin, value.patch);
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
    if (value.resource === 'visas') {
      applyPatch(servicesStore.visas, value.patch);
    }
    if (value.resource === 'courier') {
      applyPatch(servicesStore.courier, value.patch);
    }
    if (value.resource === 'friends') {
      applyPatch(servicesStore.friends, value.patch);
    }
    if (value.resource === 'airlift') {
      applyPatch(servicesStore.airlift, value.patch);
    }
  }
  // TODO do we need initial anymore?
  if (value.response === 'initial') {
    if (value.resource === 'desktop') {
      applySnapshot(servicesStore.desktop, value.model);
    }
    if (value.resource === 'shell') {
      applySnapshot(servicesStore.shell, value.model);
    }
    // if (value.resource === 'courier') {
    //   applySnapshot(servicesStore.courier, value.model);
    // }
    // if (value.resource === 'ship') {
    //   servicesStore.setShip(ShipModel.create(value.model));
    // }
    if (value.resource === 'spaces') {
      applySnapshot(servicesStore.bazaar, castToSnapshot(value.model.bazaar));
      applySnapshot(servicesStore.beacon, castToSnapshot(value.model.beacon));
      applySnapshot(servicesStore.spaces, castToSnapshot(value.model.spaces));
      applySnapshot(
        servicesStore.bulletin,
        castToSnapshot(value.model.bulletin)
      );
      applySnapshot(
        servicesStore.membership,
        castToSnapshot(value.model.membership)
      );
    }
    if (value.resource === 'airlift') {
      applySnapshot(servicesStore.airlift, castToSnapshot(value.model.airlift));
    }
    if (value.resource === 'auth') {
      // authState.authStore.initialSync(value);
    }
    if (value.resource === 'theme') {
      // osState.theme.initialSync(value);
    }
  }
});
