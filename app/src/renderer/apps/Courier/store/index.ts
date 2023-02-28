import { createContext, useContext } from 'react';
import { flow, Instance, types, tryReference } from 'mobx-state-tree';
import { ChatDBActions } from 'renderer/logic/actions/chat-db';
import { Chat } from './models';

type Subroutes = 'inbox' | 'chat' | 'new' | 'chat-info';

const ChatStore = types
  .model('ChatStore', {
    subroute: types.optional(
      types.enumeration<Subroutes>(['inbox', 'new', 'chat', 'chat-info']),
      'inbox'
    ),
    pinnedChats: types.array(types.string),
    inbox: types.array(Chat),
    selectedChat: types.maybe(types.reference(Chat)),
  })
  .views((self) => ({
    isChatPinned(path: string) {
      return self.pinnedChats.includes(path);
    },
  }))
  .actions((self) => ({
    init: flow(function* () {
      try {
        self.inbox = yield ChatDBActions.getChatList();
        const pinnedChats = yield ChatDBActions.fetchPinnedChats();
        self.pinnedChats = pinnedChats;
        return self.pinnedChats;
      } catch (error) {
        console.error(error);
        return self.pinnedChats;
      }
    }),
    setSubroute(subroute: Subroutes) {
      if (subroute === 'inbox') {
        self.selectedChat = undefined;
      }
      self.subroute = subroute;
    },
    setChat(path: string) {
      self.selectedChat = tryReference(() =>
        self.inbox.find((chat) => chat.path === path)
      );
      if (self.subroute === 'inbox') {
        self.subroute = 'chat';
      }
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
    createChat: flow(function* (
      title: string,
      creator: string,
      type: 'dm' | 'group' | 'space',
      peers: string[]
    ) {
      try {
        yield ChatDBActions.createChat(peers, type, {
          title,
          description: '',
          image: '',
          creator: creator,
          timestamp: Date.now().toString(),
          reactions: 'true',
        });
      } catch (e) {
        throw new Error('Failed to create chat');
      }
    }),
    leaveChat: flow(function* (path: string) {
      try {
        yield ChatDBActions.leaveChat(path);
        const chat = self.inbox.find((chat) => chat.path === path);
        if (chat) {
          self.inbox.remove(chat);
          self.pinnedChats.remove(path);
          return self.inbox;
        } else {
          throw new Error('Chat not found');
        }
      } catch (error) {
        console.error(error);
        return self.inbox;
      }
    }),
  }));

export const chatStore = ChatStore.create({
  subroute: 'inbox',
});

// -------------------------------
// Create core context
// -------------------------------
type ChatStoreInstance = Instance<typeof ChatStore>;
export const ChatStoreContext = createContext<null | ChatStoreInstance>(
  chatStore
);

export const ChatProvider = ChatStoreContext.Provider;
export function useChatStore() {
  const store = useContext(ChatStoreContext);
  if (store === null) {
    throw new Error('Store cannot be null, please add a context provider');
  }
  return store;
}
