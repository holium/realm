import { types, flow, Instance, tryReference } from 'mobx-state-tree';
import { LoaderModel } from '../stores/common/loader';
import { ShipModel } from '../ship/store';
import Urbit from '../api/urbit';
import { timeout } from '../utils/dev';

const StepList = types.enumeration([
  'add-ship',
  'initial',
  'profile-setup',
  'set-password',
  'realm-install',
  'completed',
]);

// const SignupProcessModel = types.model({
//   steps: types.array(
//     types.enumeration(['add-ship', 'initial', 'profile-setup', 'realm-install'])
//   ),
//   currentStep: StepList,
//   newShip: ShipModel,
//   loader: LoaderModel,
// });

export const AuthStore = types
  .model({
    firstTime: types.optional(types.boolean, false),
    steps: types.optional(types.array(types.string), [
      'add-ship',
      'initial',
      'profile-setup',
      'set-password',
      'realm-install',
      'completed',
    ]),
    currentStep: StepList,
    newShip: types.maybeNull(ShipModel),
    // profile: t
    installer: LoaderModel,
    loader: LoaderModel,
  })
  .views((self) => ({
    get isFirstTime() {
      return self.firstTime;
    },
  }))
  .actions((self) => ({
    setFirstTime() {
      self.firstTime = false;
    },
    addShip: flow(function* (payload: {
      ship: string;
      url: string;
      code: string;
    }) {
      self.loader.set('loading');
      try {
        const [_response, error] = yield Urbit.authenticate(
          payload.ship,
          payload.url,
          payload.code
        );
        if (error) throw error;
        const newShip = ShipModel.create({
          patp: payload.ship,
          url: payload.url,
          loader: { state: 'initial' },
          status: { state: 'authenticated' },
        });
        self.newShip = newShip;
        self.firstTime = true;
        self.loader.set('loaded');
      } catch (err: any) {
        self.loader.error(err);
      }
    }),
    setProfileMetadata: flow(function* (profile: {
      nickname?: string;
      color?: string;
      avatar?: string;
    }) {
      // self.loader.set('loading');
      console.log(profile);
    }),
    setPassword: flow(function* (password?: string, confirmPassword?: string) {
      // TODO encrypt all data
      console.log(password);
    }),
    installRealm: flow(function* () {
      // TODO encrypt all data
      self.installer.set('loading');
      yield timeout(3000);
      self.installer.set('loaded');

      // console.log(password);
    }),
  }));

export type AuthStoreType = Instance<typeof AuthStore>;
