import { toJS } from 'mobx';
import { flow, Instance, types } from 'mobx-state-tree';
import { ChatPathMetadata } from 'os/services/chat/chat.service';
import { ChatDBActions } from 'renderer/logic/actions/chat-db';
import { SoundActions } from 'renderer/logic/actions/sound';

export const ChatMetadataModel = types.model({
  title: types.string,
  description: types.maybe(types.string),
  image: types.maybe(types.string),
  creator: types.string,
  timestamp: types.number,
  reactions: types.optional(types.boolean, true),
});

export type ChatMetadata = Instance<typeof ChatMetadataModel>;

const stringifyMetadata = (metadata: ChatMetadata): ChatPathMetadata => {
  return {
    ...toJS(metadata),
    timestamp: metadata.timestamp.toString(),
    reactions: metadata.reactions?.toString() || 'true',
  };
};

export const ChatMessage = types
  .model('ChatMessageodel', {
    path: types.string,
    id: types.identifier,
    sender: types.string,
    contents: types.array(types.frozen()),
    reactions: types.optional(types.array(types.frozen()), []),
    reply_to: types.maybeNull(types.string),
    createdAt: types.number,
    updatedAt: types.number,
    // ui state
    pending: types.optional(types.boolean, false),
  })
  .actions((self) => ({
    setPending(pending: boolean) {
      self.pending = pending;
    },
    delete: flow(function* () {
      try {
        yield ChatDBActions.deleteMessage(self.path, self.id);
      } catch (error) {
        console.error(error);
      }
    }),
  }));
export type ChatMessageType = Instance<typeof ChatMessage>;

const ChatTypes = types.enumeration(['dm', 'group', 'space']);
export type ChatRowType = Instance<typeof ChatTypes>;

export const Chat = types
  .model('ChatModel', {
    path: types.identifier,
    type: ChatTypes,
    host: types.string,
    peers: types.array(types.string),
    peersGetBacklog: types.boolean,
    pinnedMessageId: types.maybeNull(types.string),
    lastMessage: types.maybeNull(types.array(types.frozen())),
    lastSender: types.maybeNull(types.string),
    createdAt: types.maybeNull(types.number),
    updatedAt: types.maybeNull(types.number),
    expiresDuration: types.maybeNull(types.number),
    messages: types.optional(types.array(ChatMessage), []),
    metadata: ChatMetadataModel,
    // ui state
    pending: types.optional(types.boolean, false),
    hidePinned: types.optional(types.boolean, false),
  })
  .views((self) => ({
    get pinnedChatMessage() {
      if (!self.pinnedMessageId) return null;
      return self.messages.find((m) => m.id === self.pinnedMessageId);
    },
    // Check if the pinned message is hidden locally
    isPinLocallyHidden() {
      if (!self.pinnedMessageId) return false;
      const localSettings = localStorage.getItem(self.path);
      if (!localSettings) return false;
      return JSON.parse(localSettings).hidePinned;
    },
    isMessagePinned(msgId: string) {
      return self.pinnedMessageId === msgId;
    },
    isHost(ship: string) {
      return self.host === ship;
    },
  }))
  .actions((self) => ({
    fetchMessages: flow(function* () {
      try {
        const messages = yield ChatDBActions.getChatLog(self.path);
        console.log(toJS(messages));
        self.messages = messages;
        self.hidePinned = self.isPinLocallyHidden();
        return self.messages;
      } catch (error) {
        console.error(error);
        return [];
      }
    }),
    sendMessage: flow(function* (path: string, fragments: any[]) {
      SoundActions.playDMSend();
      try {
        console.log('sending message', path, fragments);
        yield ChatDBActions.sendMessage(path, fragments);
        // self.addMessage(message);
      } catch (error) {
        console.error(error);
      }
    }),
    addMessage(message: ChatMessageType) {
      self.messages.push(message);
      self.lastSender = message.sender;
      self.lastMessage = message.contents;
    },
    deleteMessage: flow(function* (messageId: string) {
      const oldMessages = self.messages;
      try {
        yield ChatDBActions.deleteMessage(self.path, messageId);
        const message = self.messages.find((m) => m.id === messageId);
        if (!message) return;
        self.messages.remove(message);
      } catch (error) {
        self.messages = oldMessages;
        console.error(error);
      }
    }),
    setPinnedMessage: flow(function* (msgId: string) {
      try {
        yield ChatDBActions.setPinnedMessage(self.path, msgId);
        self.pinnedMessageId = msgId;
        return self.pinnedMessageId;
      } catch (error) {
        console.error(error);
        self.pinnedMessageId = null;
        return self.pinnedMessageId;
      }
    }),
    clearPinnedMessage: flow(function* (_msgId: string) {
      const oldId = self.pinnedMessageId;
      try {
        yield ChatDBActions.clearPinnedMessage(self.path);
        self.pinnedMessageId = null;
        return self.pinnedMessageId;
      } catch (error) {
        console.error(error);
        self.pinnedMessageId = oldId;
        return self.pinnedMessageId;
      }
    }),
    updateMetadata: flow(function* (metadata: Partial<ChatMetadata>) {
      const oldMetadata = self.metadata;
      const newMetadata = {
        ...self.metadata,
        ...metadata,
      };
      self.metadata = ChatMetadataModel.create(newMetadata);
      try {
        yield ChatDBActions.editChat(
          self.path,
          stringifyMetadata(self.metadata),
          self.peersGetBacklog
        );
        return self.metadata;
      } catch (e) {
        console.error(e);
        self.metadata = oldMetadata;
        return self.metadata;
      }
    }),
    updatePeersGetBacklog: flow(function* (peersGetBacklog: boolean) {
      const oldPeerGetBacklog = self.peersGetBacklog;
      self.peersGetBacklog = peersGetBacklog;
      try {
        yield ChatDBActions.editChat(
          self.path,
          stringifyMetadata(self.metadata),
          peersGetBacklog
        );
      } catch (e) {
        console.error(e);
        self.peersGetBacklog = oldPeerGetBacklog;
      }
    }),
    // Store hidePinned in localStorage
    setHidePinned: (hidePinned: boolean) => {
      localStorage.setItem(self.path, JSON.stringify({ hidePinned }));
      self.hidePinned = hidePinned;
    },
    clearChatBacklog: flow(function* () {
      const oldMessages = self.messages;
      try {
        yield ChatDBActions.clearChatBacklog(self.path);
        self.messages.clear();
        return self.messages;
      } catch (error) {
        console.error(error);
        self.messages = oldMessages;
        return self.messages;
      }
    }),
    // setPeers(peers: string[]) {},
    // setLastMessage(message: any) {},
    // setLastSender(sender: string) {},
    // setUpdatedAt(timestamp: number) {},
    // setPeersGetBacklog(getBacklog: boolean) {},
    // setExpiresDuration(duration: number) {},
  }));

export type ChatModelType = Instance<typeof Chat>;
