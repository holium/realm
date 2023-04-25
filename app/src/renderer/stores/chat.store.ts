import { createContext, useContext } from 'react';
import { toJS } from 'mobx';
// import { toJS } from 'mobx';
import {
  destroy,
  flow,
  getParentOfType,
  Instance,
  tryReference,
  types,
} from 'mobx-state-tree';
import { ChatUpdateTypes } from 'os/services/ship/chat/chat.types';
import { ChatIPC, RealmIPC } from 'renderer/stores/ipc';
import { SpacesStoreType } from 'renderer/stores/models/spaces.model';

import { Chat, ChatModelType } from './models/chat.model';
import { ShipStore, shipStore } from './ship.store';

type Subroutes = 'inbox' | 'chat' | 'new' | 'chat-info';

export const sortByUpdatedAt = (a: any, b: any) => {
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
    get sortedChatList() {
      const spacesStore: SpacesStoreType = getParentOfType(
        self,
        ShipStore
      ).spacesStore;
      const selectedPath = spacesStore.selected?.path;
      return self.inbox.slice().sort((a: ChatModelType, b: ChatModelType) => {
        // Check if the chats are space chats and match the selected space
        const isASpaceChatAndSelected =
          a.type === 'space' &&
          selectedPath === spacesStore.getSpaceByChatPath(a.path)?.path;
        const isBSpaceChatAndSelected =
          b.type === 'space' &&
          selectedPath === spacesStore.getSpaceByChatPath(b.path)?.path;

        // Compare the boolean values
        if (isASpaceChatAndSelected !== isBSpaceChatAndSelected) {
          return isBSpaceChatAndSelected ? 1 : -1;
        }

        // Check if the chats are pinned
        const isAPinned = self.pinnedChats.includes(a.path);
        const isBPinned = self.pinnedChats.includes(b.path);

        // Compare the pinned status
        if (isAPinned !== isBPinned) {
          return isBPinned ? 1 : -1;
        }

        // Compare the updatedAt or metadata.timestamp properties
        const aTimestamp = a.updatedAt || a.metadata.timestamp;
        const bTimestamp = b.updatedAt || b.metadata.timestamp;
        return bTimestamp - aTimestamp;
      });
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
      } else if (chat.type === 'space') {
        const spacesStore: SpacesStoreType = getParentOfType(
          self,
          ShipStore
        ).spacesStore;
        const space = spacesStore.getSpaceByChatPath(chat.path);
        return {
          title: chat.metadata.title,
          image: space?.picture,
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
        const pinnedChats = yield ChatIPC.fetchPinnedChats() as Promise<any>;
        localStorage.setItem(
          `${window.ship}-pinnedChats`,
          JSON.stringify(pinnedChats)
        );

        const muted = yield ChatIPC.fetchMuted() as Promise<any>;
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
    setSubroute: flow(function* (subroute: Subroutes) {
      if (subroute === 'inbox') {
        self.selectedChat = undefined;
        self.inbox = yield ChatIPC.getChatList();
      }
      self.subroute = subroute;
    }),
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
        yield ChatIPC.togglePinnedChat(path, pinned) as Promise<any>;
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
        }) as Promise<any>;
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
          yield ChatIPC.leaveChat(path) as Promise<any>;
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
    refreshInbox: flow(function* () {
      self.inbox = yield ChatIPC.getChatList();
    }),
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

export const chatStore = ChatStore.create({
  subroute: 'inbox',
  isOpen: false,
  pinnedChats: [],
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

RealmIPC.onUpdate((update) => {
  if (update.type === 'auth-success') {
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

    if (selectedChat) selectedChat.addMessage(payload);
    if (chatStore.subroute === 'inbox') chatStore.refreshInbox();

    return;
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
