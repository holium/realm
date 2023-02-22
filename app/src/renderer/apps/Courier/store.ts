import { flow, Instance, types } from 'mobx-state-tree';
import { createContext, useContext } from 'react';
import { ChatDBActions } from 'renderer/logic/actions/chat-db';

type Subroutes = 'inbox' | 'chat' | 'new' | 'chat-info';

const ChatMetadataModel = types.model({
  title: types.string,
  description: types.maybe(types.string),
  image: types.maybe(types.string),
  creator: types.string,
  timestamp: types.string,
});

export type ChatMetadata = Instance<typeof ChatMetadataModel>;

const CourierAppModel = types
  .model('CourierAppModel', {
    subroute: types.optional(
      types.enumeration<Subroutes>(['inbox', 'new', 'chat', 'chat-info']),
      'inbox'
    ),
    pinnedChats: types.array(types.string),
    selectedPath: types.maybe(types.string),
    title: types.maybe(types.string),
    peers: types.maybe(types.array(types.string)),
    type: types.maybe(types.enumeration(['dm', 'group', 'space'])),
    metadata: types.maybe(ChatMetadataModel),
  })
  .views((self) => ({
    get selectedChat() {
      if (!self.selectedPath) return undefined;
      return {
        path: self.selectedPath,
        title: self.title,
        type: self.type,
        peers: self.peers,
        metadata: self.metadata,
      };
    },
    isChatPinned(path: string) {
      return self.pinnedChats.includes(path);
    },
  }))
  .actions((self) => ({
    init: flow(function* () {
      try {
        const pinnedChats = yield ChatDBActions.fetchPinnedChats();
        console.log('loading pinned chats', pinnedChats);
        self.pinnedChats = pinnedChats;
        return self.pinnedChats;
      } catch (error) {
        console.error(error);
        return self.pinnedChats;
      }
    }),
    setSubroute(subroute: Subroutes) {
      if (subroute === 'inbox') {
        self.selectedPath = undefined;
        self.title = undefined;
        self.type = undefined;
        self.peers = undefined;
        self.metadata = undefined;
      }
      self.subroute = subroute;
    },
    setChat(
      path: string,
      title: string,
      type: 'dm' | 'group' | 'space',
      peers: string[],
      metadata: any
    ) {
      self.selectedPath = path;
      self.title = title;
      self.type = type;
      self.peers = peers as typeof self.peers;
      self.subroute = 'chat';
      self.metadata = ChatMetadataModel.create(metadata);
    },

    togglePinned: flow(function* (path: string, pinned: boolean) {
      try {
        if (pinned) {
          self.pinnedChats.push(path);
        } else {
          self.pinnedChats.remove(path);
        }
        yield ChatDBActions.togglePinnedChat(path, pinned);
        return self.pinnedChats;
      } catch (error) {
        console.error(error);
        self.pinnedChats.remove(path);
        return self.pinnedChats;
      }
    }),
    updateMetadata: flow(function* (update: ChatMetadata) {
      if (!self.selectedPath) throw new Error('No chat selected');
      if (!self.metadata) throw new Error('No selected metadata');
      const oldMetadata = self.metadata;
      try {
        self.metadata = ChatMetadataModel.create(update);
        yield ChatDBActions.editChat(self.selectedPath, update);
        return self.metadata;
      } catch (error) {
        console.error(error);
        self.metadata = oldMetadata;
        // TODO find a way to pass error to UI
        return oldMetadata;
      }
    }),
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
