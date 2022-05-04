import {
  types,
  flow,
  Instance,
  tryReference,
  castToSnapshot,
  applySnapshot,
  castToReferenceSnapshot,
  applyPatch,
  cast,
  clone,
} from 'mobx-state-tree';
import { LoaderModel } from '../stores/common/loader';
// import { ShipModel } from '../ship/store';
import {
  AuthStore as BaseAuthStore,
  AuthShip,
  AuthShipType,
} from '../../../core/auth/store';
import AuthIPC from './api';
import { WindowThemeModel } from '../stores/config';
import { sendAction } from '../api/realm.core';
import { toJS } from 'mobx';
import { authState, osState, shipState } from '../store';
import { timeout } from '../utils/dev';
import { ShipModel } from '../ship/store';
import { DEFAULT_WALLPAPER } from '../theme/store';

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
    currentStep: types.optional(StepList, 'initial'),
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
      console.log(response);
      if (error) throw error;

      self.currentStep = 'set-password';
      self.signupShip!.setContactMetadata(response);
      return response;
    }),
    clearSignupShip: () => {
      self.currentStep = 'add-ship';
      self.signupShip = undefined;
    },
    setSignupShip: (ship: any) => {
      self.currentStep = ship.status;
      self.signupShip = authState.authStore.ships.get(ship.id);
    },
    addShip: flow(function* (payload: {
      ship: string;
      url: string;
      code: string;
    }) {
      self.loader.set('loading');
      try {
        const [_response, error] = yield AuthIPC.addShip(
          payload.ship,
          payload.url,
          payload.code
        );
        // if (error) throw error;
        const signupShip = AuthShip.create({
          id: `auth${payload.ship}`,
          url: payload.url,
          patp: payload.ship,
          status: 'initial',
        });
        // Add signup ship to ship list and set as signupShip
        self.signupShip = authState.authStore.addShip(signupShip);
        self.loader.set('loaded');
        authState.authStore.setFirstTime();
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
      // yield timeout(2000);
      // TODO push AuthShip to ShipManager
      // const newShip = ShipModel.create({
      //   url: self.signupShip!.url,
      //   cookie: self.signupShip!.cookie,
      //   patp: self.signupShip!.patp,
      //   wallpaper: DEFAULT_WALLPAPER,
      //   color: self.signupShip!.color,
      //   nickname: self.signupShip!.nickname,
      //   avatar: self.signupShip!.avatar,
      //   theme: clone(self.signupShip!.theme),
      //   chat: { loader: { state: 'initial' } },
      //   contacts: { ourPatp: self.signupShip!.patp },
      //   docket: {},
      // });
      yield AuthIPC.completeSignup(self.signupShip!.patp);
      // yield authState.authStore.addAuthShip(self.signupShip!);
      self.loader.set('loaded');
    }),
  }));

export const AuthStore = BaseAuthStore.named('AuthStore')
  .views((self) => ({
    get isLoaded() {
      return self.loader.isLoaded;
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
      console.log(syncEffect);
      applySnapshot(self, castToSnapshot(syncEffect.model));
      // if (!self.selected) {
      //   self.selected = Array.from(self.ships.values())[0];
      // }
      self.loader.set('loaded');
    },
    syncPatches: (patchEffect: any) => {
      console.log('patching in auth');
      // apply background patches
      applyPatch(self, patchEffect.patch);
    },
    setSession: (shipRef: any) => {
      self.selected = shipRef;
      osState.themeStore.setWallpaper(self.selected?.wallpaper!);
      AuthIPC.setSelected(self.selected!.patp);
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
            theme: WindowThemeModel.create(shipInfo.theme),
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
