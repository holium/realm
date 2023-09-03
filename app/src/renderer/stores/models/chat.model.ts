import { toJS } from 'mobx';
import { applySnapshot, cast, flow, Instance, types } from 'mobx-state-tree';

import { ChatPathMetadata } from 'os/services/ship/chat/chat.types';
import { SoundActions } from 'renderer/lib/sound';
import { ChatIPC } from 'renderer/stores/ipc';
import { shipStore } from 'renderer/stores/ship.store';

import { expiresInMap, ExpiresValue } from '../../apps/Courier/types';

const ChatFragment = types.union(
  { eager: true },
  types.model('FragmentCustom', {
    custom: types.model({
      name: types.string,
      value: types.string,
    }),
    metadata: types.optional(types.frozen(), {}),
  }),
  types.model('FragmentPlain', {
    plain: types.string,
    metadata: types.optional(types.frozen(), {}),
  }),
  types.model('FragmentBold', {
    bold: types.string,
    metadata: types.optional(types.frozen(), {}),
  }),
  types.model('FragmentItalics', {
    italics: types.string,
    metadata: types.optional(types.frozen(), {}),
  }),
  types.model('FragmentStrike', {
    strike: types.string,
    metadata: types.optional(types.frozen(), {}),
  }),
  types.model('FragmentBoldItalics', {
    'bold-italics': types.string,
    metadata: types.optional(types.frozen(), {}),
  }),
  types.model('FragmentBoldStrike', {
    'bold-strike': types.string,
    metadata: types.optional(types.frozen(), {}),
  }),
  types.model('FragmentItalicsStrike', {
    'italics-strike': types.string,
    metadata: types.optional(types.frozen(), {}),
  }),
  types.model('FragmentBoldItalicsStrike', {
    'bold-italics-strike': types.string,
    metadata: types.optional(types.frozen(), {}),
  }),
  types.model('FragmentBlockquote', {
    blockquote: types.string,
    metadata: types.optional(types.frozen(), {}),
  }),
  types.model('FragmentInlineCode', {
    'inline-code': types.string,
    metadata: types.optional(types.frozen(), {}),
  }),
  types.model('FragmentUrl', {
    url: types.string,
    metadata: types.optional(types.frozen(), {}),
  }),
  types.model('FragmentCode', {
    code: types.string,
    metadata: types.optional(types.frozen(), {}),
  }),
  types.model('FragmentShip', {
    ship: types.string,
    metadata: types.optional(types.frozen(), {}),
  }),

  types.model('FragmentLink', {
    link: types.string,
    metadata: types.optional(types.frozen(), {}),
  }),
  types.model('FragmentImage', {
    image: types.string,
    metadata: types.maybe(
      types.model({
        width: types.maybe(types.string),
        height: types.maybe(types.string),
      })
    ),
  }),
  types.model('FragmentBreak', {
    break: types.null,
    metadata: types.optional(types.frozen(), {}),
  }),
  types.model('FragmentStatus', {
    status: types.string,
    metadata: types.optional(types.frozen(), {}),
  }),
  types.model('FramgentUrLink', {
    'ur-link': types.string,
    metadata: types.optional(types.frozen(), {}),
  })
);
export type ChatFragmentMobxType = Instance<typeof ChatFragment>;

const InvitePermission = types.enumeration(['host', 'anyone', 'open']);
export type InvitePermissionType = Instance<typeof InvitePermission>;

const PeerModel = types.model('PeerModel', {
  role: types.enumeration(['host', 'member']),
  ship: types.string,
});
export type PeerModelType = Instance<typeof PeerModel>;

// Path row metadata
export const ChatMetadataModel = types.model({
  title: types.string,
  description: types.maybe(types.string),
  image: types.maybe(types.string),
  creator: types.string,
  timestamp: types.number,
  reactions: types.optional(types.boolean, true),
  space: types.maybe(types.string),
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
    contents: types.array(ChatFragment),
    replyToPath: types.maybeNull(types.string),
    replyToMsgId: types.maybeNull(types.string),
    metadata: types.optional(types.frozen(), {}),
    createdAt: types.number,
    updatedAt: types.number,
    expiresAt: types.maybeNull(types.number),
    reactions: types.optional(types.array(ReactionModel), []),
    // ui state
    pending: types.optional(types.boolean, false),
    error: types.maybe(types.string),
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
    setError(error: string) {
      self.error = error;
    },
    updateContents(contents: any, updatedAt: number) {
      self.contents = contents;
      self.updatedAt = updatedAt;
    },
    setMetadata(metadata: any) {
      self.metadata = metadata;
    },
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
        yield ChatIPC.deleteMessage(self.path, self.id);
      } catch (error) {
        console.error(error);
      }
    }),
  }));
export type ChatMessageType = Instance<typeof ChatMessage>;

const ChatTypes = types.enumeration(['dm', 'group', 'space', 'self']);
export type ChatRowType = Instance<typeof ChatTypes>;

export const Chat = types
  .model('ChatModel', {
    path: types.identifier,
    type: ChatTypes,
    host: types.string,
    peers: types.array(PeerModel),
    muted: types.optional(types.boolean, false),
    pinned: types.optional(types.boolean, false),
    peersGetBacklog: types.boolean,
    pinnedMessageId: types.maybeNull(types.string),
    lastMessage: types.maybeNull(
      types.model({
        id: types.string,
        contents: types.array(ChatFragment),
        createdAt: types.number,
      })
    ),
    lastUpdatedAt: types.maybeNull(types.number),
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
    forwardingMsg: types.maybeNull(types.reference(ChatMessage)),
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
      return self.editingMsg?.id === msgId || false;
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
    get noPeer() {
      return self.type === 'dm' && self.peers.length === 1;
    },
  }))
  .actions((self) => ({
    fetchMessages: flow(function* () {
      self.lastFetch = new Date().getTime();
      try {
        const messages = yield ChatIPC.getChatLog(self.path);
        self.hidePinned = self.isPinLocallyHidden();
        applySnapshot(self.messages, messages);
        return self.messages;
      } catch (error) {
        console.error(error);
        return [];
      }
    }),
    fetchPeers: flow(function* (our: string) {
      try {
        self.our = our;
        const peers = yield ChatIPC.getChatPeers(self.path);
        self.peers = peers.map((p: PeerModelType) =>
          PeerModel.create({ ship: p.ship, role: p.role })
        );
      } catch (error) {
        console.error(error);
      }
    }),
    sendMessage: flow(function* (path: string, fragments: any[]) {
      shipStore.settingsStore.systemSoundsEnabled && SoundActions.playDMSend();
      try {
        // create temporary message
        const tempContents: ChatFragmentMobxType = fragments.map((f) =>
          ChatFragment.create({ ...f.content, metadata: f.metadata })
        );
        const message = ChatMessage.create({
          id: `temp-${new Date().getTime()}`,
          path: self.path,
          contents: tempContents,
          sender: window.ship,
          pending: true,
          replyToMsgId: self.replyingMsg?.id,
          createdAt: new Date().getTime(),
          updatedAt: new Date().getTime(),
        });
        self.messages.push(message);
        self.lastSender = message.sender;
        const lastContents: ChatFragmentMobxType = fragments.map((f) =>
          ChatFragment.create({ ...f.content, metadata: f.metadata })
        );
        self.lastMessage = {
          id: message.id,
          contents: lastContents,
          createdAt: new Date().getTime(),
        };
        self.lastUpdatedAt = new Date().getTime();
        self.replyingMsg = null;
        yield ChatIPC.sendMessage(path, fragments);
      } catch (error) {
        console.error(error);
      }
    }),
    forwardMessage: flow(function* (path: string, fragments: any[]) {
      shipStore.settingsStore.systemSoundsEnabled && SoundActions.playDMSend();
      try {
        yield ChatIPC.sendMessage(path, fragments);
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
      const pendingIdx = self.messages.findIndex(
        (m) => m.sender === message.sender && m.id.includes('temp')
      );
      if (pendingIdx !== -1) {
        self.messages.splice(pendingIdx, 1, message);
      } else {
        self.messages.push(message);
      }
      self.lastSender = message.sender;
      self.lastMessage = {
        id: message.id,
        contents: message.contents,
        createdAt: message.createdAt,
      };
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
      // if the message is the last message, update the last message
      if (self.lastMessage?.id === message.id) {
        self.lastMessage = {
          id: message.id,
          contents: message.contents,
          createdAt: message.createdAt,
        };
      }
      // self.lastUpdatedAt = new Date().getTime();
    },
    deleteMessage: flow(function* (messageId: string) {
      let success = true;
      try {
        yield ChatIPC.deleteMessage(self.path, messageId);
      } catch (error) {
        console.error(error);
        success = false;
        self.messages
          .find((m) => m.id === messageId)
          ?.setError('Failed to delete');
      }
      if (success) {
        const message = self.messages.find((m) => m.id === messageId);
        if (!message) return;
        self.messages.remove(message);
      }
    }),
    muteNotification: flow(function* (mute: boolean) {
      try {
        self.muted = mute;
        yield ChatIPC.toggleMutedChat(self.path, mute);
      } catch (error) {
        console.error(error);
        self.muted = !mute;
      }
    }),
    removeMessage(messageId: string) {
      const message = self.messages.find((m) => m.id === messageId);
      if (!message) return;
      self.messages.remove(message);
    },
    setPinnedMessage: flow(function* (msgId: string) {
      try {
        yield ChatIPC.setPinnedMessage(self.path, msgId);
        self.pinnedMessageId = msgId;
        return self.pinnedMessageId;
      } catch (error) {
        console.error(error);
        self.pinnedMessageId = null;
        return self.pinnedMessageId;
      }
    }),
    setMuted(muted: boolean) {
      self.muted = muted;
    },
    setPinned(pinned: boolean) {
      self.pinned = pinned;
    },
    clearPinnedMessage: flow(function* (_msgId: string) {
      const oldId = self.pinnedMessageId;
      try {
        yield ChatIPC.clearPinnedMessage(self.path);
        self.pinnedMessageId = null;
        return self.pinnedMessageId;
      } catch (error) {
        console.error(error);
        self.pinnedMessageId = oldId;
        return self.pinnedMessageId;
      }
    }),
    setForwarding(message: ChatMessageType) {
      self.forwardingMsg = message;
    },
    clearForwarding() {
      self.forwardingMsg = null;
    },
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
        if (chatMsg && window.ship)
          chatMsg.insertTempReaction({ msgId, emoji, by: window.ship });
        yield ChatIPC.sendMessage(self.path, [
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
        yield ChatIPC.deleteMessage(self.path, reactionId);
      } catch (err) {
        console.error(err);
      }
    }),
    clearReacting() {
      self.isReacting = undefined;
    },
    setEditing(message: ChatMessageType) {
      if (self.editingMsg !== null) {
        /* workaround for chat getting updated when going
        from one edit message to another */
        localStorage.removeItem(self.path);
      }
      self.editingMsg = message;
    },
    saveEditedMessage: flow(function* (messageId: string, contents: any[]) {
      const oldMessages = self.messages;
      try {
        // find the message and update it
        const message = self.messages.find((m) => m.id === messageId);
        if (!message) return;
        self.editingMsg = null;
        message.setMetadata({ edited: 'true' });
        message.updateContents(
          contents.map((frag) => frag.content),
          Date.now()
        );
        yield ChatIPC.editMessage(
          self.path,
          messageId,
          contents.map((c) => ({
            ...c,
            metadata: { edited: 'true' },
          }))
        );
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
        yield ChatIPC.editChatMetadata(
          self.path,
          stringifyMetadata(self.metadata),
          self.invites,
          self.peersGetBacklog,
          self.expiresDuration || 0
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
        yield ChatIPC.editChatMetadata(
          self.path,
          stringifyMetadata(self.metadata),
          self.invites,
          peersGetBacklog,
          self.expiresDuration || 0
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
        yield ChatIPC.editChatMetadata(
          self.path,
          stringifyMetadata(self.metadata),
          self.invites,
          self.peersGetBacklog,
          self.expiresDuration || 0
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
        yield ChatIPC.editChatMetadata(
          self.path,
          stringifyMetadata(self.metadata),
          self.invites,
          self.peersGetBacklog,
          self.expiresDuration || 0
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
        yield ChatIPC.clearChatBacklog(self.path);
        self.messages.clear();
        return self.messages;
      } catch (error) {
        console.error(error);
        self.messages = oldMessages;
        return self.messages;
      }
    }),
    addPeer: flow(function* (ship: string) {
      try {
        yield ChatIPC.addPeerToChat(self.path, ship) as Promise<void>;
      } catch (error) {
        console.error(error);
      }
      return self.peers;
    }),
    removePeer: flow(function* (ship: string) {
      const oldPeers = self.peers;
      try {
        yield ChatIPC.removePeerFromChat(self.path, ship) as Promise<void>;
        const peer = self.peers.find((p) => p.ship === ship);

        if (!peer) return;
        self.peers.remove(peer);
        return self.peers;
      } catch (error) {
        console.error(error);
        self.peers = oldPeers;
        return self.peers;
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
