/* eslint-disable func-names */
import { types, flow, Instance, tryReference } from 'mobx-state-tree';
import { LoaderModel } from './common/loader';
import { setFirstTime } from '../store';
import { WindowThemeModel, WindowThemeType } from './config';

import Urbit from '../api/urbit';

type ShipInfoType = {
  url: string;
  cookie: string;
  theme?: WindowThemeType;
  wallpaper?: string;
  color?: string;
  nickname?: string;
  avatar?: string;
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
    color: types.optional(types.string, '#000000'),
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
  })
  .actions((self) => ({
    login(password: string) {
      console.log('use password to decrypt all stores and load context state');
      // window.electron
      self.loggedIn = true;
    },
    logout() {
      self.loggedIn = false;
    },
    setTheme(windowTheme: WindowThemeType) {
      self.theme = windowTheme;
    },
  }));

export type ShipModelType = Instance<typeof ShipModel>;

export const ShipStore = types
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
        const [response, error] = yield Urbit.login(ship, password);
        if (error) throw error;
        console.log('login', response);
        self.loader.set('loaded');
        const session = self.ships.get(ship);
        if (session?.patp !== ship) {
          self.session = session;
        }
        self.session!.login(password);
        setFirstTime();
      } catch (err: any) {
        self.loader.error(err);
      }
    }),
    // login: (ship: string, password: string) => {
    // const session = self.ships.get(ship);
    // if (session?.patp !== ship) {
    //   self.session = session;
    // }
    // self.session!.login(password);
    //   //
    //   // return null;
    // },
    logout: () => {
      self.session!.logout();
      // self.session = undefined;
    },
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

        self.loader.set('loaded');
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
            loader: { state: 'initial' },
            status: { state: 'authenticated' },
          });
          self.ships.set(patp, newShip);
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
