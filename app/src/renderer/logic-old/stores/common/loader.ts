import { types, Instance } from 'mobx-state-tree';

export const LoaderModel = types
  .model({
    errorMessage: types.optional(types.string, ''),
    state: types.optional(
      types.enumeration('LoaderState', [
        'initial',
        'loading',
        'error',
        'loaded',
      ]),
      'initial'
    ),
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
