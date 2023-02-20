import { Instance, types } from 'mobx-state-tree';
import { createContext, useContext } from 'react';

type Subroutes = 'inbox' | 'chat' | 'new' | 'chat-info';

const CourierAppModel = types
  .model('CourierAppModel', {
    subroute: types.optional(
      types.enumeration<Subroutes>(['inbox', 'new', 'chat', 'chat-info']),
      'inbox'
    ),
    selectedPath: types.maybe(types.string),
    title: types.maybe(types.string),
    type: types.maybe(types.enumeration(['dm', 'group', 'channel'])),
  })
  .actions((self) => ({
    setSubroute(subroute: Subroutes) {
      if (subroute === 'inbox') {
        self.selectedPath = undefined;
        self.title = undefined;
        self.type = undefined;
      }
      self.subroute = subroute;
    },
    setChat(path: string, title: string, type: 'dm' | 'group' | 'channel') {
      self.selectedPath = path;
      self.title = title;
      self.type = type;
      self.subroute = 'chat';
    },
  }));

export const chatStore = CourierAppModel.create({
  subroute: 'inbox',
  selectedPath: undefined,
});

// -------------------------------
// Create core context
// -------------------------------
type CourierAppInstance = Instance<typeof CourierAppModel>;
export const CourierAppContext = createContext<null | CourierAppInstance>(
  chatStore
);

export const ChatProvider = CourierAppContext.Provider;
export function useChatStore() {
  const store = useContext(CourierAppContext);
  if (store === null) {
    throw new Error('Store cannot be null, please add a context provider');
  }
  return store;
}
