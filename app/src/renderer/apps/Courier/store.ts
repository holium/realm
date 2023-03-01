import { createContext, useContext } from 'react';
import { toJS } from 'mobx';
import {
  flow,
  Instance,
  types,
  tryReference,
  resolveIdentifier,
} from 'mobx-state-tree';
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
    get pinnedChatList() {
      return self.inbox
        .filter((c) => self.pinnedChats.includes(c.path))
        .sort((a, b) =>
          b.updatedAt && a.updatedAt ? b.updatedAt - a.updatedAt : 0
        );
    },
    get unpinnedChatList() {
      return self.inbox
        .filter((c) => !self.pinnedChats.includes(c.path))
        .sort((a, b) =>
          b.updatedAt && a.updatedAt ? b.updatedAt - a.updatedAt : 0
        );
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
      console.log(self.subroute);
      if (self.subroute === 'inbox') {
        self.subroute = 'chat';
      }
      console.log(self.subroute);
      console.log(toJS(self.selectedChat));
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
        const chat = self.inbox.find((chat) => chat.path === path);
        if (chat) {
          self.inbox.remove(chat);
          self.pinnedChats.remove(path);
          yield ChatDBActions.leaveChat(path);
          return self.inbox;
        } else {
          throw new Error('Chat not found');
        }
      } catch (error) {
        console.error(error);
        return self.inbox;
      }
    }),
    onPathsAdded(path: any) {
      self.inbox.push(path);
    },
    // This is a handler for onDbChange
    onPathDeleted(path: string) {
      const chat = self.inbox.find((chat) => chat.path === path);
      if (chat) {
        self.inbox.remove(chat);
        self.pinnedChats.remove(path);
        return self.inbox;
      } else {
        throw new Error('Chat not found');
      }
    },
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

// -------------------------------
// Listen for changes
ChatDBActions.onDbChange((_evt, type, data) => {
  if (type === 'path-added') {
    console.log('path added', data);
    chatStore.onPathsAdded(data);
  }
  if (type === 'path-deleted') {
    console.log('path deleted', data);
    chatStore.onPathDeleted(data);
  }
  if (type === 'message-deleted') {
    console.log('message deleted', data);
    console.log(resolveIdentifier(ChatStore, chatStore, data));
    // selectedChat. (data.msgId);
  }
  if (type === 'message-received') {
    console.log('message received', data);

    const selectedChat = chatStore.inbox.find(
      (chat) => chat.path === data.path
    );
    if (!selectedChat) {
      console.warn('selected chat not found');
      return;
    }
    selectedChat.addMessage(data);
  }
});
