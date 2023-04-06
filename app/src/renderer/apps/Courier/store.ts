import { createContext, useContext } from 'react';
import { toJS } from 'mobx';
import { flow, Instance, types, tryReference, destroy } from 'mobx-state-tree';
import { ChatDBActions } from 'renderer/logic/actions/chat-db';
import { Chat, ChatModelType } from './models';
import { OSActions } from 'renderer/logic/actions/os';
import { servicesStore } from 'renderer/logic/store';

type Subroutes = 'inbox' | 'chat' | 'new' | 'chat-info';

const sortByUpdatedAt = (a: ChatModelType, b: ChatModelType) => {
  return (
    (b.updatedAt || b.metadata.timestamp) -
    (a.updatedAt || a.metadata.timestamp)
  );
};

const ChatStore = types
  .model('ChatStore', {
    subroute: types.optional(
      types.enumeration<Subroutes>(['inbox', 'new', 'chat', 'chat-info']),
      'inbox'
    ),
    pinnedChats: types.array(types.string),
    inbox: types.array(Chat),
    selectedChat: types.maybe(types.reference(Chat)),
    isOpen: types.boolean,
  })
  .views((self) => ({
    isChatPinned(path: string) {
      return self.pinnedChats.includes(path);
    },
    isChatMuted(path: string) {
      return self.inbox.find((c) => path === c.path)?.muted || false;
    },
    isChatSelected(path: string) {
      return self.selectedChat?.path === path;
    },
    get pinnedChatList() {
      return self.inbox
        .filter((c) => self.pinnedChats.includes(c.path) || (c.type === 'space-chat' && c.path.includes(servicesStore.spaces.selected.path)) )
        .sort(sortByUpdatedAt);
    },
    get unpinnedChatList() {
      return self.inbox
        .filter((c) => !self.pinnedChats.includes(c.path))
        .filter((c) => !(self.pinnedChats.includes(c.path) || (c.type === 'space-chat' && c.path.includes(servicesStore.spaces.selected.path)) ))
        .sort(sortByUpdatedAt);
    },
    getChatHeader(path: string): {
      title: string;
      sigil?: any;
      image?: string;
    } {
      const chat = self.inbox.find((c) => c.path === path);
      if (!window.ship || !chat) return { title: 'Error loading title' };
      if (chat.type === 'dm') {
        const peer = chat.peers.filter((p) => p.ship !== window.ship)[0];
        const ship = peer?.ship;
        const { nickname, avatar, color } =
          servicesStore.friends.getContactAvatarMetadata(ship);
        return {
          title: nickname || ship || 'Error loading title',
          sigil: {
            patp: ship,
            color: color ? [color, '#FFF'] : ['#000', '#FFF'],
            nickname: nickname || '',
          },
          image: avatar || chat.metadata.image,
        };
      } else {
        return {
          title: chat.metadata.title,
          image: chat.metadata.image,
        };
      }
    },
  }))
  .actions((self) => ({
    init: flow(function* () {
      try {
        self.inbox = yield ChatDBActions.getChatList();
        const pinnedChats = yield ChatDBActions.fetchPinnedChats();
        localStorage.setItem(
          `${window.ship}-pinnedChats`,
          JSON.stringify(pinnedChats)
        );

        const muted = yield ChatDBActions.fetchMutedChats();
        self.inbox.forEach((chat) => {
          chat.setMuted(muted.includes(chat.path));
        });
        self.pinnedChats = pinnedChats;
        return self.pinnedChats;
      } catch (error) {
        console.error(error);
        return self.pinnedChats;
      }
    }),
    setOpened() {
      self.isOpen = true;
    },
    setClosed() {
      self.isOpen = false;
    },
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
        localStorage.setItem(
          `${window.ship}-pinnedChats`,
          JSON.stringify(self.pinnedChats)
        );
        return self.pinnedChats;
      } catch (error) {
        console.error(error);
        self.pinnedChats.remove(path);
        return self.pinnedChats;
      }
    }),
    toggleMuted: flow(function* (path: string, muted: boolean) {
      const chat = self.inbox.find((chat) => chat.path === path);
      if (chat) {
        yield chat.muteNotification(muted);
      } else {
        console.info(`chat ${path} not found`);
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
        console.error('Failed to create chat');
      }
    }),
    leaveChat: flow(function* (path: string) {
      try {
        const chat = self.inbox.find((chat) => chat.path === path);
        if (chat) {
          if (self.selectedChat?.path === path) {
            self.selectedChat = undefined;
            self.subroute = 'inbox';
          }
          self.inbox.remove(chat);
          self.pinnedChats.remove(path);
          yield ChatDBActions.leaveChat(path);
        } else {
          console.info(`chat ${path} not found`);
        }
      } catch (error) {
        console.error(error);
      }
    }),
    onPathsAdded(path: any) {
      console.log('onPathsAdded', toJS(path));
      self.inbox.push(path);
    },
    // This is a handler for onDbChange
    onPathDeleted(path: string) {
      const chat = self.inbox.find((chat) => chat.path === path);
      if (chat) {
        if (self.selectedChat?.path === path) {
          self.selectedChat = undefined;
          self.subroute = 'inbox';
        }
        self.inbox.remove(chat);
        // destroy(chat);
        self.pinnedChats.remove(path);
      }
    },
    reset() {
      self.subroute = 'inbox';
      self.pinnedChats.clear();
      self.inbox.forEach((chat) => destroy(chat));
      self.inbox.clear();
      self.selectedChat = undefined;
      self.isOpen = false;
    },
  }));

// -------------------------------
// TODO Write a caching layer for the inbox
const pinnedChats = localStorage.getItem(`${window.ship}-pinnedChats`);

export const chatStore = ChatStore.create({
  subroute: 'inbox',
  isOpen: false,
  pinnedChats: pinnedChats ? JSON.parse(pinnedChats) : [],
});

// -------------------------------
// Create core context
// -------------------------------
export type ChatStoreInstance = Instance<typeof ChatStore>;
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

OSActions.onBoot(() => {
  chatStore.init();
});
OSActions.onConnected(() => {
  chatStore.init();
});
OSActions.onLogout((_event: any) => {
  chatStore.reset();
});
// -------------------------------
// Listen for changes
ChatDBActions.onDbChange((_evt, type, data) => {
  if (type === 'path-added') {
    console.log('onPathsAdded', toJS(data));
    chatStore.onPathsAdded(data);
  }
  if (type === 'path-deleted') {
    console.log('onPathDeleted', data);
    chatStore.onPathDeleted(data);
  }
  if (type === 'message-deleted') {
    const selectedChat = chatStore.inbox.find(
      (chat) => chat.path === data.path
    );
    if (!selectedChat) return;
    selectedChat.removeMessage(data['msg-id']);
  }
  if (type === 'message-received') {
    // console.log('addMessage', data);
    const selectedChat = chatStore.inbox.find(
      (chat) => chat.path === data.path
    );
    if (!selectedChat) return;
    selectedChat.addMessage(data);
  }
  if (type === 'message-edited') {
    const selectedChat = chatStore.inbox.find(
      (chat) => chat.path === data.path
    );
    if (!selectedChat) return;
    selectedChat.replaceMessage(data);
  }
  if (type === 'peer-added') {
    const selectedChat = chatStore.inbox.find(
      (chat) => chat.path === data.path
    );
    if (!selectedChat) return;
    console.log('onPeerAdded', toJS(data));
    selectedChat.onPeerAdded(data.ship, data.role);
  }
  if (type === 'peer-deleted') {
    const selectedChat = chatStore.inbox.find((chat) => chat.path === data.row);
    if (!selectedChat) return;
    console.log('onPeerDeleted', toJS(data));
    selectedChat.onPeerDeleted(data.ship);
  }
});
