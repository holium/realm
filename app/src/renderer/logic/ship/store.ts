/* eslint-disable func-names */
import {
  types,
  flow,
  Instance,
  applyPatch,
  applySnapshot,
  castToSnapshot,
} from 'mobx-state-tree';
import { toJS } from 'mobx';
import { LoaderModel } from '../stores/common/loader';
import { WindowThemeType } from '../stores/config';
import { ShipModel as BaseShipModel } from '../../../core/ship/stores/ship';
import { authState, osState, spacesState } from '../store';
import { AuthShipType } from '../../../core/auth/store';

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

type BaseShipModelType = typeof BaseShipModel;

export const ShipModel = BaseShipModel.named('ShipModel')
  .views((self) => ({
    get isLoaded() {
      return self.loader.isLoaded;
    },
    get isLoading() {
      return self.loader.isLoading;
    },
    get apps() {
      return Array.from(self.docket.apps.values());
    },
  }))
  .actions((self) => ({
    syncPatches: (patchEffect: any) => {
      // const patchingShip = self.ships.get(patchEffect.key);
      // apply background patches
      applyPatch(self, patchEffect.patch);
    },
    // logout() {
    //   self.loggedIn = false;
    //   const action = {
    //     action: 'set-session',
    //     resource: 'auth.manager',
    //     context: {
    //       ship: self.patp,
    //     },
    //     data: {
    //       key: 'loggedIn',
    //       value: false,
    //     },
    //   };
    //   sendAction(action);
    // },
    // setTheme(baseColor: string, bgLuminosity: 'light' | 'dark') {
    //   const windowTheme: WindowThemeType = {
    //     backgroundColor: baseColor,
    //     dockColor:
    //       bgLuminosity === 'dark'
    //         ? lighten(0.01, baseColor)
    //         : lighten(0.2, baseColor),
    //     windowColor:
    //       bgLuminosity === 'dark'
    //         ? lighten(0.1, baseColor)
    //         : lighten(0.2, baseColor),
    //     textColor:
    //       bgLuminosity === 'dark'
    //         ? lighten(0.6, baseColor)
    //         : darken(0.6, baseColor),
    //     textTheme: bgLuminosity,
    //   };
    //   const action = {
    //     action: 'set-ship-theme',
    //     resource: 'ship.manager',
    //     context: {
    //       ship: self.patp,
    //     },
    //     data: {
    //       key: 'theme',
    //       value: windowTheme,
    //     },
    //   };
    //   sendAction(action);
    //   sendAction({
    //     action: 'set-ship-theme',
    //     resource: 'auth.manager',
    //     context: {
    //       ship: self.patp,
    //     },
    //     data: {
    //       key: 'theme',
    //       value: windowTheme,
    //     },
    //   });
    // },
  }));

export type ShipModelType = Instance<typeof ShipModel>;
export const ShipStore = types
  .model('ShipStore', {
    ship: types.maybe(ShipModel),
    shipLoader: types.optional(LoaderModel, { state: 'initial' }),
  })
  .actions((self) => ({
    addNewShip: flow(function* (authShip: AuthShipType) {
      console.log('should add', authShip);
    }),
    initialSync: (syncEffect: {
      key: string;
      model: Instance<typeof ShipModel>;
    }) => {
      // Apply persisted snapshot
      applySnapshot(self, castToSnapshot({ ship: syncEffect.model }));
      // osState.themeStore.theme.setMouseColor(
      //   syncEffect.model.color || '#4E9EFD'
      // );

      spacesState.setShipSpace(self.ship!);

      // TODO clean up authstore
      authState.authStore.loader.set('loaded');
      self.ship!.loader.set('loaded');
      self.shipLoader.set('loaded');
      self.ship!.chat.loader.set('loaded');
      // self.setLoggedIn();
    },
    //
    // syncPatches: (patchEffect: any) => {
    //   // const patchingShip = self.ships.get(patchEffect.key);
    //   // apply background patches
    //   applyPatch(self.ship, patchEffect.patch);
    // },
  }));
