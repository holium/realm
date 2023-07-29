import { useEffect, useState } from 'react';
import { Instance, types } from 'mobx-state-tree';

const RootStore = types.model({});

export type IRootStore = Instance<typeof RootStore>;

const ConnectionState = types.model({
  isConnected: types.boolean,
});

type IConnectionState = Instance<typeof ConnectionState>;

export function useConnectionState() {
  const [connectionState, _] = useState<IConnectionState>();
  useEffect(() => {}, [connectionState?.isConnected]);
  return connectionState;
}
