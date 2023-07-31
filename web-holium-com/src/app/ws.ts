import { useEffect, useState } from 'react';
import { Instance, types } from 'mobx-state-tree';

export const ConnectionState = types.model({
  isConnected: types.boolean,
});

export type IConnectionState = Instance<typeof ConnectionState>;

export const SpacesStore = types.model({
  path: types.identifier,
  name: types.string,
});

export type ISpacesStore = Instance<typeof SpacesStore>;

const handleSpacesMessage = (message: any): void => {
  console.log('spaces response received: %o', message);
};

export const AppModel = types
  .model('AppModel', {
    connectionState: types.optional(ConnectionState, { isConnected: false }),
    spaces: types.optional(types.maybeNull(SpacesStore), null),
  })
  .actions((_self) => ({
    // find a "child" store by app name
    onMessage(app: string, message: any): any {
      switch (app) {
        case 'spaces':
          handleSpacesMessage(message);
          return;

        default:
          return;
      }
    },
  }));

export type AppStore = Instance<typeof AppModel>;

export const RootModel = types.model({
  app: AppModel,
});

export type IRootStore = Instance<typeof RootModel>;

export function useConnectionState() {
  const [connectionState, _setConnectionState] = useState<IConnectionState>();
  useEffect(() => {}, [connectionState?.isConnected]);
  return connectionState;
}
