import {
  detach,
  Instance,
  types,
  flow,
  applySnapshot,
  castToSnapshot,
} from 'mobx-state-tree';
import { ThemeModel } from '../shell/theme.model';
import { LoaderModel } from '../common.model';
import { StepList } from '../common.model';

export const AuthShip = types
  .model('AuthShipModel', {
    url: types.string,
    id: types.identifier,
    patp: types.string,
    nickname: types.maybeNull(types.string),
    color: types.maybeNull(types.string),
    avatar: types.maybeNull(types.string),
    cookie: types.maybeNull(types.string),
    theme: types.optional(ThemeModel, {
      backgroundColor: '#c2b4b4',
      dockColor: '#f0ecec',
      windowColor: '#f0ecec',
      textColor: '#261f1f',
      mode: 'light',
    }),
    wallpaper: types.maybeNull(types.string),
    status: types.optional(StepList, 'initial'),
  })
  .actions((self) => ({
    setStatus(status: Instance<typeof StepList>) {
      self.status = status;
    },
    setContactMetadata: (contactMetadata: {
      color?: string;
      nickname?: string;
      avatar?: string;
    }) => {
      self.color = contactMetadata.color || '#000000';
      if (contactMetadata.nickname) self.nickname = contactMetadata.nickname;
      if (contactMetadata.avatar) self.avatar = contactMetadata.avatar;
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
  })
  .views((self) => ({
    get isLoading() {
      return self.loader.isLoading;
    },
    get isLoaded() {
      return self.loader.isLoaded;
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
    completeSignup(id: string) {
      self.selected = self.ships.get(id);
      if (!self.order.find((orderedShip: any) => orderedShip.id === id)) {
        self.order.push(id);
      }
    },
    setShip(newShip: AuthShipType) {
      self.ships.set(newShip.id, newShip);
    },
    setSelected(newShip: AuthShipType) {
      self.selected = newShip;
    },
    deleteShip(patp: string) {
      self.selected = self.ships.get(self.order[0]);
      self.order.splice(
        self.order.findIndex((value: string) => value === `auth${patp}`)
      );
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
    logout(ship: string) {
      try {
        // const [response, error] = yield AuthIPC.logout(ship);
        // if (error) throw error;
        // servicesStore.shell.desktop.setIsBlurred(true);
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
  }));

export type AuthStoreType = Instance<typeof AuthStore>;
