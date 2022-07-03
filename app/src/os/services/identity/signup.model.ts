import {
  detach,
  flow,
  Instance,
  types,
  applySnapshot,
  castToSnapshot,
} from 'mobx-state-tree';
import { LoaderModel } from '../common.model';
import { StepList } from '../common.model';
import { AuthShip } from './auth.model';

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
    signupShip: types.maybe(AuthShip), // base ship model
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
    initialSync: (syncEffect: {
      key: string;
      model: Instance<typeof self>;
    }) => {
      // Apply persisted snapshot
      applySnapshot(self, castToSnapshot(syncEffect.model));

      self.loader.set('loaded');
    },
    clearSignupShip: () => {
      self.currentStep = 'add-ship';
      self.signupShip = undefined;
    },
    setSignupShip: (ship: any) => {
      self.currentStep = ship.status;
      self.signupShip = ship;
    },
    addShip: flow(function* (payload: {
      ship: string;
      url: string;
      code: string;
    }) {
      self.loader.set('loading');
      console.log(payload);
      try {
        // const [response, error] = yield AuthIPC.addShip(
        //   payload.ship,
        //   payload.url,
        //   payload.code
        // );
        // if (error) throw error;
        const signupShip = AuthShip.create({
          id: `auth${payload.ship}`,
          url: payload.url,
          // cookie: payload.cookie,
          patp: payload.ship,
          status: 'initial',
        });

        // Add signup ship to ship list and set as signupShip
        // self.signupShip =
        //   servicesStore.AuthService.authStore.addShip(signupShip);
        self.loader.set('loaded');
        // AuthService.authStore.setFirstTime();
      } catch (err: any) {
        self.loader.error(err);
      }
    }),
    installRealm: flow(function* () {
      self.installer.set('loading');
      // yield timeout(5000);
      self.installer.set('loaded');
    }),
    completeSignup: flow(function* () {
      self.loader.set('loading');
      // yield AuthIPC.storeNewShip(self.signupShip!.patp);

      // servicesStore.AuthService.authStore.setFirstTime();
      self.loader.set('loaded');
    }),
  }));
export type SignupStoreType = Instance<typeof SignupStore>;
