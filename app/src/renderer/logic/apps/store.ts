import { createContext, useContext } from 'react';
import { Instance, types } from 'mobx-state-tree';
import { AssemblyAppState } from './assembly';

export const TrayAppStore = types.model('TrayAppStore', {
  assemblyApp: AssemblyAppState,
});

export const trayStore = TrayAppStore.create({
  assemblyApp: {
    currentView: 'list',
    selected: undefined,
    assemblies: [
      {
        id: 'degen-chat-for-da-bois',
        title: 'Degen chat for da bois',
        host: '~labruc-dillyx-lomder-librun',
        people: ['~labruc-dillyx-lomder-librun', '~bus', '~fes'],
        cursors: true,
        private: false,
      },
    ],
  },
});

// -------------------------------
// Create core context
// -------------------------------
export type TrayInstance = Instance<typeof TrayAppStore>;
const TrayStateContext = createContext<null | TrayInstance>(trayStore);

export const CoreProvider = TrayStateContext.Provider;
export function useTrayApps() {
  const store = useContext(TrayStateContext);
  if (store === null) {
    throw new Error('Store cannot be null, please add a context provider');
  }
  return store;
}
