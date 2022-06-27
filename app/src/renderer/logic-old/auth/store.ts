import {
  types,
  flow,
  Instance,
  tryReference,
  castToSnapshot,
  applySnapshot,
  castToReferenceSnapshot,
  applyPatch,
  getSnapshot,
  onAction,
} from 'mobx-state-tree';
import { LoaderModel } from '../stores/common/loader';
import { servicesStore } from '../../logic/store-2';
import {
  AuthStore as BaseAuthStore,
  AuthShip,
  AuthShipType,
} from '../../../core-a/auth/store';
import AuthIPC from './api';
import { sendAction } from '../../logic/realm.core';

import { timeout } from '../utils/dev';
import { ThemeModel } from '../theme/store';

const handleError = (error: any) => {
  if (error.includes('ECONNREFUSED')) {
    return { status: 'connection' };
  }
};

const StepList = types.enumeration([
  'add-ship',
  'initial',
  'profile-setup',
  'set-password',
  'realm-install',
  'completed',
]);

export const SignupStore = types
  .model({
    loader: types.optional(LoaderModel, { state: 'initial' }),
    steps: types.optional(types.array(types.string), [
      'add-ship',
      'initial',
      'profile-setup',
      'set-password',
      'realm-install',
      'completed',
    ]),
    currentStep: types.optional(StepList, 'add-ship'),
    signupShip: types.safeReference(AuthShip), // base ship model
    installer: types.optional(LoaderModel, { state: 'initial' }),
  })
  .views((self) => ({
    get isLoaded() {
      return self.loader.isLoaded;
    },
    get isLoading() {
      return self.loader.isLoading;
    },
  }))
  .actions((self) => ({
    getProfile: flow(function* () {
      const [response, error] = yield AuthIPC.getProfile(self.signupShip!.patp);
      if (error) throw error;
      self.currentStep = 'profile-setup';
      self.signupShip!.setContactMetadata(response);
      return response;
    }),
    saveProfile: flow(function* (form: {
      nickname: string;
      color: string;
      avatar: string;
    }) {
      self.loader.set('loading');
      const [response, error] = yield AuthIPC.saveProfile(
        self.signupShip!.patp,
        form
      );
      self.loader.set('loaded');
      // console.log(handleError(error));
      if (error) throw error;

      servicesStore.shell.desktop.setMouseColor(response.color);
      self.signupShip!.setContactMetadata(response);
      self.currentStep = 'set-password';
      return response;
    }),
    clearSignupShip: () => {
      self.currentStep = 'add-ship';
      self.signupShip = undefined;
    },
    setSignupShip: (ship: any) => {
      self.currentStep = ship.status;

      self.signupShip = servicesStore.AuthService.authStore.ships.get(ship.id);
    },
    addShip: flow(function* (payload: {
      ship: string;
      url: string;
      code: string;
    }) {
      self.loader.set('loading');
      console.log(payload);
      try {
        const [response, error] = yield AuthIPC.addShip(
          payload.ship,
          payload.url,
          payload.code
        );
        // if (error) throw error;
        const signupShip = AuthShip.create({
          id: `auth${payload.ship}`,
          url: payload.url,
          // cookie: payload.cookie,
          patp: payload.ship,
          status: 'initial',
        });

        // Add signup ship to ship list and set as signupShip
        self.signupShip =
          servicesStore.AuthService.authStore.addShip(signupShip);
        self.loader.set('loaded');
        // AuthService.authStore.setFirstTime();
      } catch (err: any) {
        self.loader.error(err);
      }
    }),
    installRealm: flow(function* () {
      self.installer.set('loading');
      yield timeout(5000);
      self.installer.set('loaded');
    }),
    completeSignup: flow(function* () {
      self.loader.set('loading');
      yield AuthIPC.storeNewShip(self.signupShip!.patp);

      servicesStore.AuthService.authStore.setFirstTime();
      self.loader.set('loaded');
    }),
  }));

export const AuthStore = BaseAuthStore.named('AuthStore')
  .views((self) => ({
    get isLoaded() {
      return self.loader.isLoaded;
    },
    get currentShip() {
      let selectedShip = self.selected;
      // console.log('current', getSnapshot(selectedShip));
      if (!selectedShip) {
        selectedShip = self.order[0];
        // console.log('in ordered', getSnapshot(selectedShip));
      }
      return selectedShip;
    },
  }))
  .views((self) => ({
    get isLoaded() {
      return self.loader.isLoaded;
    },
    get isLoading() {
      return self.loader.isLoading;
    },
    get hasShips() {
      return (
        Array.from(self.ships.entries()).filter(
          (value: any) => value.status === 'completed'
        ).length > 0
      );
    },
    hasInProgressShips() {
      return (
        Array.from(self.ships.entries()).filter(
          (value: any) => value.status !== 'completed'
        ).length > 0
      );
    },
    get inProgressList(): any {
      return Array.from(self.ships.entries())
        .map((entry: any) => {
          return {
            patp: entry[0],
            ...entry[1],
          };
        })
        .filter((value: any) => value.status !== 'completed')
        .sort((a, b) => self.order.indexOf(b) - self.order.indexOf(a));
    },
    get shipList(): any {
      return Array.from(self.ships.entries())
        .map((entry: any) => {
          return {
            patp: entry[0],
            ...entry[1],
          };
        })
        .sort((a, b) => self.order.indexOf(b) - self.order.indexOf(a));
    },
  }))
  .actions((self) => ({
    setFirstTime() {
      self.firstTime = false;
    },
    initialSync: (syncEffect: {
      key: string;
      model: Instance<typeof self>;
    }) => {
      // Apply persisted snapshot
      applySnapshot(self, castToSnapshot(syncEffect.model));
      // on initial sync we should set themes and various other variables

      self.selected?.loggedIn &&
        servicesStore.shell.desktop.setIsBlurred(false);
      self.selected?.loggedIn &&
        servicesStore.shell.desktop.setMouseColor(self.selected?.color!);
      self.loader.set('loaded');
    },
    syncPatches: (patchEffect: any) => {
      // apply background patches
      applyPatch(self, patchEffect.patch);
    },
    setSession: (shipRef: any) => {
      self.selected = shipRef;

      servicesStore.shell.theme.setWallpaper(self.currentShip!.wallpaper!, {
        patp: self.currentShip!.patp!,
      });
      AuthIPC.setSelected(self.currentShip!.patp);
    },
    clearSession() {
      self.selected = undefined;
    },
    setOrder(newOrder: any) {
      self.order = newOrder;
      const action = {
        action: 'set-order',
        resource: 'auth.manager',
        data: {
          key: 'order',
          value: castToReferenceSnapshot(newOrder),
        },
      };
      sendAction(action);
    },
    login: flow(function* (ship: string, password: string) {
      try {
        self.loader.set('loading');
        const [response, error] = yield AuthIPC.login(ship, password);
        self.selected!.setLoggedIn(true);

        servicesStore.shell.desktop.setIsBlurred(false);
        servicesStore.shell.desktop.setMouseColor(self.selected?.color!);
        if (error) throw error;
      } catch (err: any) {
        self.loader.error(err);
      }
    }),
    logout: flow(function* (ship: string) {
      try {
        const [response, error] = yield AuthIPC.logout(ship);
        if (error) throw error;
        self.selected!.setLoggedIn(false);

        servicesStore.shell.desktop.setIsBlurred(true);
      } catch (err: any) {
        self.loader.error(err);
      }
    }),
    addAuthShip: flow(function* (ship: AuthShipType) {
      self.ships.set(ship.id, castToSnapshot(ship));
      // TODO
      console.log(self.ships.get(ship.id));
      return self.ships.get(ship.id);
    }),
    addShip: (ship: AuthShipType) => {
      self.ships.set(ship.id, ship);
      return self.ships.get(ship.id);
    },
    getShips: flow(function* () {
      self.loader.set('loading');
      try {
        const [response, error]: [{ [key: string]: AuthShipType }, any] =
          yield AuthIPC.getShips();
        if (error) throw error;

        Object.keys(response).forEach((patp: string) => {
          const shipInfo: AuthShipType = response[patp];
          const newShip = AuthShip.create({
            id: shipInfo.id,
            patp: shipInfo.patp,
            url: shipInfo.url,
            wallpaper: shipInfo.wallpaper,
            color: shipInfo.color,
            nickname: shipInfo.nickname,
            avatar: shipInfo.avatar,
            theme: ThemeModel.create(shipInfo.theme),
            loggedIn: shipInfo.loggedIn,
          });
          self.ships.set(newShip.id, newShip);
          // if (shipInfo.loggedIn) {
          //   console.log('reconnect');
          //   self.selected = newShip;
          //   init(patp);
          // }
          // TODO fix these commented out things
          // if (
          //   self.order.length &&
          //   self.order.findIndex(
          //     (orderedShip: AuthShipType) => orderedShip.id! === newShip.id!
          //   ) === -1
          // ) {
          //   // we need to add a new ordered ref
          //   self.order.push(newShip);
          // }
        });
        console.log('loaded selected', self.selected);
        if (self.ships.size > 0 && !self.selected) {
          // Set first ship in list
          self.selected = tryReference(() =>
            self.ships.get(Array.from(self.order.values())[0]!.id)
          );
        }
        self.loader.set('loaded');
      } catch (err: any) {
        self.loader.error(err);
      }
    }),
    removeShip: flow(function* (ship: string) {
      const [response, error] = yield AuthIPC.removeShip(ship);
      if (error) throw error;
      const removeIndex = self.order.findIndex(
        (ordered: any) => ordered.patp === ship
      );
      console.log(self.order.length, removeIndex, self.selected, ship);
      self.order.splice(removeIndex, 1);
      if (self.order.length > 0) {
        self.selected = self.order[removeIndex - 1 || 0];
      } else {
        self.selected = undefined;
      }
      self.ships.delete(`auth${ship}`);
    }),
  }));

export type AuthStoreType = Instance<typeof AuthStore>;

// "url": "https://test-moon-2.holium.network",
// 			"patp": "~wacrel-ripdet-lomder-librun",
// 			"nickname": null,
// 			"color": null,
// 			"avatar": "https://cdn.cloudflare.steamstatic.com/steamcommunity/public/images/avatars/d5/d5fd6d6976cf75a133f115eb3114523f6c460133_full.jpg",
// 			"cookie": "urbauth-~wacrel-ripdet-lomder-librun=0v3.e94nq.u6k94.dd6g9.epeaj.bgrqo; Path=/; Max-Age=604800",
// 			"theme": {
// 				"backgroundColor": "#727367",
// 				"dockColor": "#757669",
// 				"windowColor": "#8c8d80",
// 				"textTheme": "dark",
// 				"textColor": "#fff",
// 				"iconColor": "#333333"
// 			},
// 			"loggedIn": false,
// 			"wallpaper": "https://lomder-librun.sfo3.digitaloceanspaces.com/media/18okOoNv-E7K_2400x2400.jpeg",
// "loader": {
// 	"errorMessage": "",
// 	"state": "initial"
// },
