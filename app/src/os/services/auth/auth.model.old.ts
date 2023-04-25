import {
  applySnapshot,
  castToSnapshot,
  detach,
  flow,
  Instance,
  types,
} from 'mobx-state-tree';
import { Patp } from 'os/types';

import { LoaderModel } from '../../../renderer/stores/models/common.model';

export const AuthShip = types
  .model('AuthShipModel', {
    url: types.string,
    id: types.identifier,
    patp: types.string,
    nickname: types.maybeNull(types.string),
    color: types.maybeNull(types.string),
    avatar: types.maybeNull(types.string),
    mnemonic: types.maybe(types.string),
    status: types.frozen(),
    passwordHash: types.maybeNull(types.string),
  })
  .actions((self) => ({
    setMnemonic(mnemonic: string) {
      self.mnemonic = mnemonic;
    },
  }));

export type AuthShipType = Instance<typeof AuthShip>;

export const AuthStore = types
  .model('AuthStore', {
    firstTime: types.boolean,
    loader: types.optional(LoaderModel, { state: 'initial' }),
    selected: types.safeReference(AuthShip), // patp string
    ships: types.map(AuthShip),
    order: types.optional(types.array(types.string), []), // patp string
    accountId: types.maybe(types.string),
    email: types.maybe(types.string),
    clientSecret: types.maybe(types.string),
  })
  .views((self) => ({
    get isLoading() {
      return self.loader.isLoading;
    },
    get isLoaded() {
      return self.loader.isLoaded;
    },
    get isFirstTime() {
      return self.firstTime;
    },
    get currentShip() {
      let selectedShip = self.selected;
      if (!selectedShip) {
        selectedShip = self.ships.get(self.order[0]);
      }
      return selectedShip;
    },
    get hasShips() {
      return (
        Array.from(self.ships.entries()).filter(
          (value: any) => value.status === 'completed'
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
    get addedShips() {
      return Array.from(self.ships.entries()).map((entry: any) => {
        return entry[1].patp;
      });
    },
    get mnemonic() {
      return self.selected?.mnemonic;
    },
  }))
  .actions((self) => ({
    setFirstTime() {
      self.firstTime = false;
    },
    setLoader(state: 'initial' | 'loading' | 'error' | 'loaded') {
      self.loader.set(state);
    },
    setOrder(newOrder: any) {
      self.order.replace(newOrder);
    },
    setSession: (shipRef: any) => {
      self.selected = shipRef;
    },
    setAccountId: (accountId: string) => {
      self.accountId = accountId;
    },
    setEmail: (email: string) => {
      self.email = email;
    },
    setClientSecret: (secret: string) => {
      self.clientSecret = secret;
    },
    getPasswordHash(id: string) {
      return self.ships.get(id)?.passwordHash;
    },
    completeSignup(id: string) {
      self.selected = self.ships.get(id);
      if (
        self.order.findIndex((orderedShip: Patp) => orderedShip === id) === -1
      ) {
        self.order.push(id.toString());
      }
    },
    setShip(newShip: AuthShipType) {
      self.ships.set(newShip.id, newShip);
    },
    setShipProfile(
      id: string,
      nickname: string,
      color: string,
      avatar: string
    ) {
      const ship = self.ships.get(id);
      if (!ship) return;
      ship.nickname = nickname;
      ship.color = color;
      ship.avatar = avatar;
      self.ships.set(id, ship);
    },
    setSelected(newShip: AuthShipType) {
      self.selected = newShip;
    },
    deleteShip(patp: string) {
      // set first ship
      if (self.order.length === 1) {
        self.selected = undefined;
      } else {
        self.selected = self.ships.get(self.order[0]);
      }
      // remove ship from order list
      self.order.splice(
        self.order.findIndex((value: string) => value === `auth${patp}`),
        1
      );
      // delete ship
      self.ships.delete(`auth${patp}`);
    },
    clearSelected() {
      detach(self.selected);
    },
    initialSync: (syncEffect: {
      key: string;
      model: Instance<typeof self>;
    }) => {
      // Apply persisted snapshot
      applySnapshot(self, castToSnapshot(syncEffect.model));
      // on initial sync we should set themes and various other variables
    },
    clearSession() {
      self.selected = undefined;
    },
    login(id: string) {
      self.loader.set('loading');
      const loggedInShip = self.ships.get(id);
      self.selected = loggedInShip;
    },
    logout(_ship: string) {
      try {
        // const [response, error] = yield AuthIPC.logout(ship);
        // if (error) throw error;
      } catch (err: any) {
        self.loader.error(err);
      }
    },
    removeShip: flow(function* (ship: string) {
      // const [response, error] = yield AuthIPC.removeShip(ship);
      // if (error) throw error;
      const removeIndex = self.order.findIndex(
        (ordered: any) => ordered.patp === ship
      );
      console.log(self.order.length, removeIndex, self.selected, ship);
      self.order.splice(removeIndex, 1);
      if (self.order.length > 0) {
        self.selected = self.ships.get(self.order[removeIndex - 1 || 0]);
      } else {
        self.selected = undefined;
      }
      self.ships.delete(`auth${ship}`);
    }),
    setMnemonic: (mnemonic: string) => {
      self.selected?.setMnemonic(mnemonic);
    },
  }));

export type AuthStoreType = Instance<typeof AuthStore>;
