import { toJS } from 'mobx';
import { flow, applySnapshot, Instance, types, cast } from 'mobx-state-tree';
import { ChatPathMetadata } from 'os/services/chat/chat.service';
import { ChatDBActions } from 'renderer/logic/actions/chat-db';
import { SoundActions } from 'renderer/logic/actions/sound';
import { expiresInMap, ExpiresValue } from './types';

const InvitePermission = types.enumeration(['host', 'anyone']);
export type InvitePermissionType = Instance<typeof InvitePermission>;

const PeerModel = types.model('PeerModel', {
  role: types.enumeration(['host', 'member']),
  ship: types.string,
});
export type PeerModelType = Instance<typeof PeerModel>;

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

const ReactionModel = types.model('ReactionModel', {
  msgId: types.string,
  by: types.string,
  emoji: types.string,
});
export type ReactionModelType = Instance<typeof ReactionModel>;

export const ChatMessage = types
  .model('ChatMessageModel', {
    path: types.string,
    id: types.identifier,
    sender: types.string,
    contents: types.array(types.frozen()),
    replyToPath: types.maybeNull(types.string),
    replyToMsgId: types.maybeNull(types.string),
    metadata: types.optional(types.frozen(), {}),
    createdAt: types.number,
    updatedAt: types.number,
    reactions: types.optional(types.array(ReactionModel), []),
    // ui state
    pending: types.optional(types.boolean, false),
  })
  .views((self) => ({
    get reactionsList() {
      return self.reactions;
    },
  }))
  .actions((self) => ({
    setPending(pending: boolean) {
      self.pending = pending;
    },
    updateContents(contents: any, updatedAt: number) {
      self.contents = contents;
      self.updatedAt = updatedAt;
    },
    getReplyTo: () => {
      if (!self.replyToPath || !self.replyToMsgId) return null;
      return ChatDBActions.getChatReplyTo(self.replyToMsgId);
    },
    fetchReactions: flow(function* () {
      try {
        const reactions = yield ChatDBActions.getChatReactions(
          self.path,
          self.id
        );
        applySnapshot(self.reactions, reactions);
        return self.reactions;
      } catch (error) {
        console.error(error);
        return [];
      }
    }),
    insertTempReaction(react: ReactionModelType) {
      self.reactions.push({
        emoji: react.emoji,
        by: react.by,
        msgId: `${react.emoji}-${react.by}`,
      });
    },
    insertReaction(react: ReactionModelType) {
      const replaceIdx = self.reactions.findIndex(
        (react) => react.msgId === `${react.emoji}-${react.by}`
      );
      if (replaceIdx !== -1) {
        self.reactions[replaceIdx] = react;
      } else {
        self.reactions.push(react);
      }
    },
    removeReaction(msgId: string) {
      const reactionIdx = self.reactions.findIndex(
        (react) => react.msgId === msgId
      );
      if (reactionIdx === -1) return;
      const reactions = self.reactions.slice();
      reactions.splice(reactionIdx, 1);
      self.reactions = cast(reactions);
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
    peers: types.array(PeerModel),
    // peerRows: types.array(PeerModel),
    peersGetBacklog: types.boolean,
    pinnedMessageId: types.maybeNull(types.string),
    lastMessage: types.maybeNull(types.array(types.frozen())),
    lastSender: types.maybeNull(types.string),
    createdAt: types.maybeNull(types.number),
    updatedAt: types.maybeNull(types.number),
    expiresDuration: types.maybeNull(types.number),
    messages: types.optional(types.array(ChatMessage), []),
    invites: InvitePermission,
    metadata: ChatMetadataModel,
    // ui state
    pending: types.optional(types.boolean, false),
    hidePinned: types.optional(types.boolean, false),
    editingMsg: types.maybeNull(types.reference(ChatMessage)),
    replyingMsg: types.maybeNull(types.reference(ChatMessage)),
    our: types.maybe(types.string),
    isReacting: types.maybe(types.string),
    lastFetch: types.maybeNull(types.number),
  })
  .views((self) => ({
    get pinnedChatMessage() {
      if (!self.pinnedMessageId) return null;
      return self.messages.find((m) => m.id === self.pinnedMessageId);
    },
    get sortedPeers() {
      return self.peers.slice().sort((a: PeerModelType, b: PeerModelType) =>
        // sort host to top, then self, then others
        a.role === 'host'
          ? -1
          : b.role === 'host'
          ? 1
          : a.ship === self.our
          ? -1
          : b.ship === self.our
          ? 1
          : 0
      );
    },
    isEditing(msgId: string) {
      return self.editingMsg?.id === msgId;
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
        self.messages = messages;
        self.hidePinned = self.isPinLocallyHidden();
        self.lastFetch = new Date().getTime();
        return self.messages;
      } catch (error) {
        console.error(error);
        return [];
      }
    }),
    fetchPeers: flow(function* (our: string) {
      try {
        self.our = our;
        const peers = yield ChatDBActions.getChatPeers(self.path);
        self.peers = peers.map((p: PeerModelType) =>
          PeerModel.create({ ship: p.ship, role: p.role })
        );
      } catch (error) {
        console.error(error);
      }
    }),

    sendMessage: flow(function* (path: string, fragments: any[]) {
      SoundActions.playDMSend();
      try {
        console.log('sending message', path, fragments);
        yield ChatDBActions.sendMessage(path, fragments);
        self.replyingMsg = null;
        // TODO naive send, should add to local store and update on ack
        // self.addMessage(message);
      } catch (error) {
        console.error(error);
      }
    }),
    addMessage(message: ChatMessageType) {
      if (Object.keys(message.contents[0])[0] === 'react') {
        const msg = self.messages.find((m) => m.id === message.replyToMsgId);
        if (msg)
          msg.insertReaction({
            msgId: message.id,
            emoji: message.contents[0].react,
            by: message.sender,
          });
        return;
      }
      self.messages.push(message);
      self.lastSender = message.sender;
      self.lastMessage = message.contents;
    },
    replaceMessage(message: ChatMessageType) {
      const msg = self.messages.find((m) => m.id === message.id);
      if (!msg) {
        return console.warn(
          'tried to replace a message that doesnt exist',
          message.id
        );
      }
      msg.updateContents(message.contents, message.updatedAt);
      // self.messages.replace([...self.messages, msg]);
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
    removeMessage(messageId: string) {
      const message = self.messages.find((m) => m.id === messageId);
      if (!message) return;
      self.messages.remove(message);
    },
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
    setReplying(message: ChatMessageType) {
      self.replyingMsg = message;
    },
    clearReplying() {
      self.replyingMsg = null;
    },
    setReacting(msgId: string) {
      self.isReacting = msgId;
    },
    sendReaction: flow(function* (msgId: string, emoji: string) {
      const chatMsg = self.messages.find((m) => m.id === msgId);
      try {
        if (chatMsg && self.our)
          chatMsg.insertTempReaction({ msgId, emoji, by: self.our });
        yield ChatDBActions.sendMessage(self.path, [
          {
            content: { react: emoji },
            'reply-to': {
              path: self.path,
              'msg-id': msgId,
            },
            metadata: {},
          },
        ]);
        self.isReacting = undefined;
      } catch (err) {
        console.error(err);
      }
    }),
    deleteReaction: flow(function* (messageId: string, reactionId: string) {
      const chatMsg = self.messages.find((m) => m.id === messageId);
      try {
        if (chatMsg) chatMsg.removeReaction(reactionId);
        yield ChatDBActions.deleteMessage(self.path, reactionId);
      } catch (err) {
        console.error(err);
      }
    }),
    clearReacting() {
      self.isReacting = undefined;
    },
    setEditing(message: ChatMessageType) {
      self.editingMsg = message;
    },
    saveEditedMessage: flow(function* (messageId: string, contents: any[]) {
      const oldMessages = self.messages;
      try {
        yield ChatDBActions.editMessage(
          self.path,
          messageId,
          contents.map((c) => ({
            ...c,
            metadata: { edited: 'true' },
          }))
        );
        // todo intermeidate state?
        self.editingMsg = null;
      } catch (error) {
        self.messages = oldMessages;
        console.error(error);
      }
    }),
    cancelEditing() {
      self.editingMsg = null;
    },
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
          self.invites,
          self.peersGetBacklog,
          self.expiresDuration
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
          self.invites,
          peersGetBacklog,
          self.expiresDuration
        );
      } catch (e) {
        console.error(e);
        self.peersGetBacklog = oldPeerGetBacklog;
      }
    }),
    updateInvitePermissions: flow(function* (
      invitePermission: InvitePermissionType
    ) {
      const oldInvitePermission = self.invites;
      self.invites = invitePermission;
      try {
        yield ChatDBActions.editChat(
          self.path,
          stringifyMetadata(self.metadata),
          self.invites,
          self.peersGetBacklog,
          self.expiresDuration
        );
      } catch (e) {
        console.error(e);
        self.invites = oldInvitePermission;
      }
    }),
    updateExpiresDuration: flow(function* (expiresValue: ExpiresValue) {
      const oldExpiresDuration = self.expiresDuration;
      self.expiresDuration = expiresInMap[expiresValue] || null;
      try {
        yield ChatDBActions.editChat(
          self.path,
          stringifyMetadata(self.metadata),
          self.invites,
          self.peersGetBacklog,
          self.expiresDuration
        );
      } catch (e) {
        console.error(e);
        self.expiresDuration = oldExpiresDuration;
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
    onPeerAdded(ship: string, role: string) {
      self.peers.push(PeerModel.create({ ship, role }));
    },
    onPeerDeleted(ship: string) {
      const peer = self.peers.find((p) => p.ship === ship);
      if (!peer) return;
      self.peers.remove(peer);
    },
    // setPeers(peers: string[]) {},
    // setLastMessage(message: any) {},
    // setLastSender(sender: string) {},
    // setUpdatedAt(timestamp: number) {},
    // setPeersGetBacklog(getBacklog: boolean) {},
    // setExpiresDuration(duration: number) {},
  }));

export type ChatModelType = Instance<typeof Chat>;
