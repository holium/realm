import { Instance, types } from 'mobx-state-tree';

export const StepList = types.enumeration([
  'add-ship',
  'initial',
  'profile-setup',
  'set-password',
  'realm-install',
  'completed',
]);

const LoaderStates = types.enumeration('LoaderState', [
  'initial',
  'loading',
  'error',
  'loaded',
]);

export const LoaderModel = types
  .model({
    errorMessage: types.optional(types.string, ''),
    state: types.optional(LoaderStates, 'initial'),
  })
  .views((self) => ({
    get isLoading() {
      return self.state === 'loading';
    },
    get isLoaded() {
      return self.state === 'loaded';
    },
  }))
  .actions((self) => ({
    set(state: typeof self.state) {
      self.state = state;
    },
    error(error: Error) {
      self.state = 'error';
      // eslint-disable-next-line no-console
      console.error(error);
      self.errorMessage = error.toString();
    },
    clearError() {
      self.state = 'initial';
      self.errorMessage = '';
    },
  }));

export type LoaderModelType = Instance<typeof LoaderModel>;
export type LoaderStateType = Instance<typeof LoaderStates>;

export const SubscriptionModel = types
  .model({
    state: types.optional(
      types.enumeration('LoaderState', [
        'subscribed',
        'subscribing',
        'unsubscribed',
      ]),
      'subscribing'
    ),
  })
  .actions((self) => ({
    set(state: 'subscribed' | 'subscribing' | 'unsubscribed') {
      self.state = state;
    },
  }));
