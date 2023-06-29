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
import { ChatIPC } from 'renderer/stores/ipc';
import { SpacesStoreType } from 'renderer/stores/models/spaces.model';

import { Chat, ChatModelType } from './models/chat.model';
import { LoaderModel } from './models/common.model';
import { ShipStore, shipStore } from './ship.store';

export type Subroutes = 'inbox' | 'chat' | 'new' | 'chat-info' | 'passport';

export const sortByUpdatedAt = (a: ChatModelType, b: ChatModelType) => {
  return (
    (b.updatedAt || b.metadata.timestamp) -
    (a.updatedAt || a.metadata.timestamp)
  );
};

export const ChatStore = types
  .model('ChatStore', {
    subroute: types.optional(
      types.enumeration<Subroutes>([
        'inbox',
        'new',
        'chat',
        'chat-info',
        'passport',
      ]),
      'inbox'
    ),
    pinnedChats: types.array(types.string),
    mutedChats: types.array(types.string),
    inbox: types.array(Chat),
    selectedChat: types.maybe(types.reference(Chat)),
    isOpen: types.boolean,
    inboxLoader: LoaderModel,
    inboxInitLoader: LoaderModel,
    inboxMetadataLoader: LoaderModel,
    chatLoader: LoaderModel,
  })
  .views((self) => ({
    isChatPinned(path: string) {
      return !!self.pinnedChats.find((p) => path === p);
    },
    isChatMuted(path: string) {
      return !!self.mutedChats.find((p) => path === p);
    },
    isChatSelected(path: string) {
      return self.selectedChat?.path === path;
    },
    // like sortedChatList but we don't apply to space chats - causes jumpiness
    get sortedStandaloneChatList() {
      return self.inbox.slice().sort((a: ChatModelType, b: ChatModelType) => {
        // Check if the chats are pinned
        const isAPinned = self.pinnedChats.includes(a.path);
        const isBPinned = self.pinnedChats.includes(b.path);

        // Compare the pinned status
        if (isAPinned !== isBPinned) {
          return isBPinned ? 1 : -1;
        }

        // Compare the updatedAt or metadata.timestamp properties
        const aTimestamp =
          a.lastMessage?.createdAt || a.updatedAt || a.metadata.timestamp;
        const bTimestamp =
          b.lastMessage?.createdAt || b.updatedAt || b.metadata.timestamp;
        return bTimestamp - aTimestamp;
      });
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
        const aTimestamp =
          a.lastMessage?.createdAt || a.updatedAt || a.metadata.timestamp;
        const bTimestamp =
          b.lastMessage?.createdAt || b.updatedAt || b.metadata.timestamp;
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
      self.inboxInitLoader.set('loading');

      try {
        const pinned = yield ChatIPC.fetchPinnedChats();
        const muted = yield ChatIPC.fetchMuted();
        self.inbox = yield ChatIPC.getChatList();
        self.mutedChats = muted;
        self.pinnedChats = pinned;
      } catch (error) {
        console.error(error);
      }

      self.inboxInitLoader.set('loaded');

      return self.inbox;
    }),
    fetchInboxMetadata: flow(function* () {
      self.inboxMetadataLoader.set('loading');
      const { muted, pinned } = yield ChatIPC.fetchPathMetadata();
      self.pinnedChats = pinned;
      self.mutedChats = muted;
      self.inboxMetadataLoader.set('loaded');
    }),
    loadChatList: flow(function* () {
      self.inboxLoader.set('loading');

      try {
        const initialInbox = yield ChatIPC.getChatList();
        const pins = initialInbox
          .filter((chat: any) => chat.pinned)
          .map((chat: any) => chat.path);
        const mutes = initialInbox
          .filter((chat: any) => chat.muted)
          .map((chat: any) => chat.path);

        self.inbox = initialInbox;
        self.pinnedChats = pins;
        self.mutedChats = mutes;
      } catch (error) {
        console.error(error);
      }

      self.inboxLoader.set('loaded');
    }),
    findChatDM: flow(function* (peer: string, our: string) {
      // find the DM, if exists, where it's only ourselves and the peer
      try {
        const path = yield ChatIPC.findChatDM(peer, our);
        return path;
      } catch (error) {
        console.error(error);
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
    setChat: flow(function* (path: string) {
      self.chatLoader.set('loading');
      self.selectedChat = tryReference(() =>
        self.inbox.find((chat) => chat.path === path)
      );
      yield ChatIPC.refreshMessagesOnPath(path, window.ship);
      if (self.subroute === 'inbox') {
        self.subroute = 'chat';
      }
      self.chatLoader.set('loaded');
    }),
    togglePinned: flow(function* (path: string, pinned: boolean) {
      try {
        if (pinned) {
          self.pinnedChats.push(path);
        } else {
          self.pinnedChats.remove(path);
        }
        self.inbox.forEach((chat) => {
          chat.setPinned(self.pinnedChats.includes(chat.path));
        });
        yield ChatIPC.togglePinnedChat(path, pinned) as Promise<any>;
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
        if (muted) {
          self.mutedChats.push(path);
        } else {
          self.mutedChats.remove(path);
        }
      } else {
        console.info(`chat ${path} not found`);
      }
    }),
    createChat: flow(function* (
      title: string,
      creator: string,
      type: 'dm' | 'group' | 'space' | 'self',
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
    _onInit(payload: any) {
      if (self.inboxInitLoader.isFirstLoad) {
        self.inbox = payload;
        localStorage.setItem(`${window.ship}-firstLoad`, 'true');
      }
    },
  }));

// -------------------------------
// TODO Write a caching layer for the inbox

// -------------------------------
// Create core context
// -------------------------------
export type ChatStoreInstance = Instance<typeof ChatStore>;

// -------------------------------
// Listen for changes
ChatIPC.onUpdate(({ type, payload }: ChatUpdateTypes) => {
  if (type === 'init') {
    shipStore.chatStore._onInit(payload);
  }
  if (type === 'path-added') {
    shipStore.chatStore.onPathsAdded(payload);
  }
  if (type === 'path-deleted') {
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
    const selectedChat = shipStore.chatStore.inbox.find(
      (chat) => chat.path === payload.path
    );

    if (selectedChat) selectedChat.addMessage(payload);
    if (shipStore.chatStore.subroute === 'inbox') {
      shipStore.chatStore.refreshInbox();
    }

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
    selectedChat.onPeerAdded(payload.ship, payload.role);
  }
  if (type === 'peer-deleted') {
    const selectedChat = shipStore.chatStore.inbox.find(
      (chat) => chat.path === payload.row
    );
    if (!selectedChat) return;
    selectedChat.onPeerDeleted(payload.ship);
  }
});
