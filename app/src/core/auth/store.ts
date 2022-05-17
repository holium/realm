import { toJS } from 'mobx';
import { detach, Instance, types, destroy } from 'mobx-state-tree';
import { ThemeModel } from '../../renderer/logic/theme/store';
import { LoaderModel } from '../../renderer/logic/stores/common/loader';

const StepList = types.enumeration([
  'add-ship',
  'initial',
  'profile-setup',
  'set-password',
  'realm-install',
  'completed',
]);

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
      themeId: 'base',
      backgroundColor: '#c2b4b4',
      dockColor: '#f0ecec',
      windowColor: '#f0ecec',
      textColor: '#261f1f',
      textTheme: 'light',
    }),
    loggedIn: types.optional(types.boolean, false),
    wallpaper: types.maybeNull(types.string),
    status: types.optional(StepList, 'initial'),
  })
  .actions((self) => ({
    setLoggedIn(loggedIn: boolean) {
      self.loggedIn = loggedIn;
    },
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
    order: types.optional(types.array(types.safeReference(AuthShip)), []), // patp string
  })
  .actions((self) => ({
    setFirstTime() {
      self.firstTime = false;
    },
    completeSignup(id: string) {
      self.selected = self.ships.get(id);
      if (!self.order.find((orderedShip: any) => orderedShip.id === id)) {
        self.order.push(self.ships.get(id));
      }
    },
    setShip(newShip: AuthShipType) {
      self.ships.set(newShip.id, newShip);
    },
    setSelected(newShip: AuthShipType) {
      self.selected = newShip;
    },
    deleteShip(patp: string) {
      destroy(self.ships.get(`auth${patp}`));
    },
    clearSelected() {
      detach(self.selected);
    },
  }));

export type AuthStoreType = Instance<typeof AuthStore>;
