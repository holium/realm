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
import { authState, osState } from '../store';

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
  }))
  .actions((self) => ({
    getProfile: flow(function* () {
      const [response, error] = yield AuthIPC.getProfile(self.signupShip!.patp);
      console.log(response);
      if (error) throw error;
      self.currentStep = 'profile-setup';
      self.signupShip!.setContactMetadata(response);
      return response;
    }),
    setSignupShip: (ship: AuthShipType) => {
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
          id: `auth~${payload.ship}`,
          url: payload.url,
          patp: payload.ship,
          status: 'initial',
        });
        self.signupShip = signupShip;
        self.loader.set('loaded');
        authState.authStore.setFirstTime();
      } catch (err: any) {
        self.loader.error(err);
      }
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
      return self.ships.size > 0;
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
