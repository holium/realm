import { createContext, useContext } from 'react';
import { toJS } from 'mobx';
import { flow, Instance, types, tryReference, destroy } from 'mobx-state-tree';
import { Chat, ChatModelType } from './models';
import { shipStore } from '../../stores/ship.store';
import { RealmIPC, ChatIPC } from 'renderer/stores/ipc';
import { RealmUpdateTypes } from 'os/realm.service';

type Subroutes = 'inbox' | 'chat' | 'new' | 'chat-info';

const sortByUpdatedAt = (a: ChatModelType, b: ChatModelType) => {
  return (
    (b.updatedAt || b.metadata.timestamp) -
    (a.updatedAt || a.metadata.timestamp)
  );
};

export const ChatStore = types
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
        .filter((c) => self.pinnedChats.includes(c.path))
        .sort(sortByUpdatedAt);
    },
    get unpinnedChatList() {
      return self.inbox
        .filter((c) => !self.pinnedChats.includes(c.path))
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
          shipStore.friends.getContactAvatarMetadata(ship);
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
        self.inbox = yield ChatIPC.getChatList();
        const pinnedChats = yield ChatIPC.fetchPinnedChats();
        localStorage.setItem(
          `${window.ship}-pinnedChats`,
          JSON.stringify(pinnedChats)
        );

        const muted = yield ChatIPC.fetchMuted();
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
        yield ChatIPC.togglePinnedChat(path, pinned);
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
        yield ChatIPC.createChat(peers, type, {
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
          self.inbox.remove(chat);
          self.pinnedChats.remove(path);
          yield ChatIPC.leaveChat(path);
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
export const ChatStoreContext =
  createContext<null | ChatStoreInstance>(chatStore);

export const ChatProvider = ChatStoreContext.Provider;
export function useChatStore() {
  const store = useContext(ChatStoreContext);
  if (store === null) {
    throw new Error('Store cannot be null, please add a context provider');
  }
  return store;
}

RealmIPC.onUpdate((_event: any, update: RealmUpdateTypes) => {
  if (update.type === 'authenticated') {
    shipStore.chatStore.init();
  }
});

// OSActions.onBoot(() => {
//   chatStore.init();
// });
// OSActions.onConnected(() => {
//   chatStore.init();
// });
// -------------------------------
// Listen for changes
type ChatUpdateTypes = { type: string; payload: any };
ChatIPC.onUpdate(({ type, payload }: ChatUpdateTypes) => {
  if (type === 'path-added') {
    console.log('onPathsAdded', toJS(payload));
    shipStore.chatStore.onPathsAdded(payload);
  }
  if (type === 'path-deleted') {
    console.log('onPathDeleted', payload);
    shipStore.chatStore.onPathDeleted(payload);
  }
  if (type === 'message-deleted') {
    const selectedChat = shipStore.chatStore.inbox.find(
      (chat) => chat.path === payload.path
    );
    if (!selectedChat) return;
    selectedChat.removeMessage(payload['msg-id']);
  }
  if (type === 'message-received') {
    // console.log('addMessage', payload);
    const selectedChat = shipStore.chatStore.inbox.find(
      (chat) => chat.path === payload.path
    );
    if (!selectedChat) return;
    selectedChat.addMessage(payload);
  }
  if (type === 'message-edited') {
    const selectedChat = shipStore.chatStore.inbox.find(
      (chat) => chat.path === payload.path
    );
    if (!selectedChat) return;
    selectedChat.replaceMessage(payload);
  }
  if (type === 'peer-added') {
    const selectedChat = shipStore.chatStore.inbox.find(
      (chat) => chat.path === payload.path
    );
    if (!selectedChat) return;
    console.log('onPeerAdded', toJS(payload));
    selectedChat.onPeerAdded(payload.ship, payload.role);
  }
  if (type === 'peer-deleted') {
    const selectedChat = shipStore.chatStore.inbox.find(
      (chat) => chat.path === payload.row
    );
    if (!selectedChat) return;
    console.log('onPeerDeleted', toJS(payload));
    selectedChat.onPeerDeleted(payload.ship);
  }
});
