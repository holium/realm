/* eslint-disable func-names */
import {
  types,
  flow,
  Instance,
  tryReference,
  applyPatch,
  applySnapshot,
} from 'mobx-state-tree';
import { LoaderModel } from '../stores/common/loader';
import { setFirstTime } from '../store';
import { WindowThemeModel, WindowThemeType } from '../stores/config';
import { sendAction } from '../api/realm.core';
import Urbit from '../api/urbit';
import { ChatStore } from './chat/store';
import { init } from './api';

type ShipInfoType = {
  url: string;
  cookie: string;
  theme?: WindowThemeType;
  wallpaper?: string;
  color?: string;
  nickname?: string;
  avatar?: string;
  loggedIn?: boolean;
};

export const ShipStatusModel = types
  .model({
    errorMessage: types.optional(types.string, ''),
    state: types.optional(
      types.enumeration([
        'initial',
        'authenticated',
        'installing',
        'installed',
        'error',
      ]),
      'initial'
    ),
  })
  .views((self) => ({
    get isInstalled() {
      return self.state === 'installed';
    },
    get isAuthenticated() {
      return self.state === 'authenticated';
    },
  }))
  .actions((self) => ({
    set(state: typeof self.state) {
      self.state = state;
    },
    error(error: Error) {
      self.state = 'error';
      // eslint-disable-next-line no-console
      self.errorMessage = error.toString();
      throw error;
    },
    clearError() {
      self.state = 'initial';
      self.errorMessage = '';
    },
  }));

export type LoaderModelType = Instance<typeof LoaderModel>;

export const ShipModel = types
  .model('ShipModel', {
    url: types.string,
    patp: types.identifier,
    nickname: types.maybeNull(types.string),
    color: types.maybeNull(types.string),
    avatar: types.maybeNull(types.string),
    loader: LoaderModel,
    status: ShipStatusModel,
    cookie: types.maybeNull(types.string),
    theme: types.optional(WindowThemeModel, {
      textColor: 'light',
      backgroundColor: '#FFFFFF',
    }),
    loggedIn: types.optional(types.boolean, false),
    wallpaper: types.maybeNull(types.string),
    chat: types.optional(ChatStore, { loader: { state: 'initial' } }),
  })
  .actions((self) => ({
    login() {
      console.log('use password to decrypt all stores and load context state');
      self.chat.loader.set('loading');
      // window.electron
      self.loggedIn = true;
      const action = {
        action: 'set-session',
        resource: 'auth.manager',
        context: {
          ship: self.patp,
        },
        data: {
          key: 'loggedIn',
          value: true,
        },
      };
      sendAction(action);
    },
    logout() {
      self.loggedIn = false;
      const action = {
        action: 'set-session',
        resource: 'auth.manager',
        context: {
          ship: self.patp,
        },
        data: {
          key: 'loggedIn',
          value: false,
        },
      };
      sendAction(action);
    },
    setTheme(windowTheme: WindowThemeType) {
      const action = {
        action: 'set-ship-theme',
        resource: 'ship.manager',
        context: {
          ship: self.patp,
        },
        data: {
          key: 'theme',
          value: windowTheme,
        },
      };
      sendAction(action);
    },
  }));

export type ShipModelType = Instance<typeof ShipModel>;

export const ShipStore: any = types
  .model({
    loader: types.optional(LoaderModel, { state: 'initial' }),
    last: types.safeReference(ShipModel),
    session: types.safeReference(ShipModel),
    ships: types.map(ShipModel),
    order: types.array(types.reference(ShipModel)),
  })
  .views((self) => ({
    get isLoading() {
      return self.loader.isLoading;
    },
    get isInstalled() {
      return self.session && self.session.status.isInstalled;
    },
    get loggedIn() {
      return self.session !== null;
    },
    get firstTime() {
      return self.ships.size > 0;
    },
    get hasShips() {
      return self.ships.size > 0;
    },
    get shipList() {
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
    initialSync: (syncEffect: any) => {
      const syncingShip = self.ships.get(syncEffect.key)!;
      applySnapshot(syncingShip, {
        ...syncEffect.model,
        chat: { loader: { state: 'initial' } },
        loader: { state: 'initial' },
        status: { state: 'authenticated' },
      });
      self.session = syncingShip;
      self.loader.set('loaded');
      self.session!.login();
    },
    syncPatches: (patchEffect: any) => {
      const patchingShip = self.ships.get(patchEffect.key);
      if (patchingShip?.chat.loader.isLoading) {
        patchingShip?.chat.loader.set('loaded');
      }
      applyPatch(patchingShip, patchEffect.patch);
    },
    setSession: (shipRef: any) => {
      self.session = shipRef;
      self.last = shipRef;
    },
    clearSession() {
      self.session = undefined;
    },
    setOrder(newOrder: any) {
      self.order = newOrder;
    },
    login: flow(function* (ship: string, password: string) {
      try {
        self.loader.set('loading');
        const [response, error] = yield Urbit.login(ship, password);
        if (error) throw error;
        setFirstTime();
      } catch (err: any) {
        self.loader.error(err);
      }
    }),
    logout: flow(function* () {
      const [response, error] = yield Urbit.logout();
      if (error) throw error;
      self.session!.logout();
      // self.session = undefined;
    }),
    addShip: flow(function* (payload: {
      ship: string;
      url: string;
      code: string;
    }) {
      self.loader.set('loading');
      try {
        const [response, error] = yield Urbit.authenticate(
          payload.ship,
          payload.url,
          payload.code
        );
        if (error) throw error;
        self.loader.set('loaded');
        const newShip = ShipModel.create({
          patp: payload.ship,
          url: payload.url,
          loader: { state: 'initial' },
          status: { state: 'authenticated' },
        });
        self.ships.set(payload.ship, newShip);
        self.order.push(newShip);
        self.session = newShip;
        setFirstTime();
      } catch (err: any) {
        self.loader.error(err);
      }
    }),
    removeShip: flow(function* (ship: string) {
      const [response, error] = yield Urbit.removeShip(ship);
      if (error) throw error;
      const removeIndex = self.order.findIndex(
        (ordered: ShipModelType) => ordered.patp === ship
      );
      console.log(self.order.length, removeIndex, self.session, ship);
      self.order.splice(removeIndex, 1);
      if (self.order.length > 0) {
        self.session = self.order[removeIndex - 1 || 0];
      } else {
        self.session = undefined;
      }
      self.ships.delete(ship);
    }),
    getShips: flow(function* () {
      self.loader.set('loading');
      try {
        const [response, error]: [{ [key: string]: ShipInfoType }, any] =
          yield Urbit.getShips();
        if (error) throw error;

        Object.keys(response).forEach((patp: string) => {
          const shipInfo: ShipInfoType = response[patp];
          const newShip = ShipModel.create({
            patp,
            url: shipInfo.url,
            wallpaper: shipInfo.wallpaper,
            color: shipInfo.color,
            nickname: shipInfo.nickname,
            avatar: shipInfo.avatar,
            theme: WindowThemeModel.create(shipInfo.theme),
            loggedIn: shipInfo.loggedIn,
            loader: { state: 'initial' },
            status: { state: 'authenticated' },
          });
          self.ships.set(patp, newShip);
          if (shipInfo.loggedIn) {
            console.log('reconnect');
            self.session = newShip;
            init(patp);
          }
          if (
            self.order.findIndex(
              (orderedShip: ShipModelType) => orderedShip.patp === patp
            ) === -1
          ) {
            // we need to add a new ordered ref
            self.order.push(newShip);
          }
        });
        console.log('loaded session', self.session);
        if (self.ships.size > 0 && !self.session) {
          // Set first ship in list
          self.session = tryReference(() =>
            self.ships.get(Array.from(self.order.values())[0].patp)
          );
        }
        self.loader.set('loaded');
      } catch (err: any) {
        self.loader.error(err);
      }
    }),
    setShip(patp: string) {
      if (self.ships.has(patp)) {
        self.session = self.ships.get(patp)!;
      } else {
        self.session = undefined;
      }
    },
  }));

export type ShipStoreType = Instance<typeof ShipStore>;
