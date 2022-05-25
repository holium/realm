import { toJS } from 'mobx';
import { flow, Instance, types } from 'mobx-state-tree';
import {
  ChatStore as BaseChatStore,
  ChatMessage as BaseChatMessage,
  Chat as BaseChat,
} from '../../../../core/ship/stores/dms';

const ChatMessage = BaseChatMessage;
export type ChatMessageType = Instance<typeof ChatMessage>;

const Chat = BaseChat.named('Chat').views((self) => ({
  get list() {
    return self.messages.slice().reverse();
  },
}));

export type ChatType = Instance<typeof Chat>;

export const ChatStore = BaseChatStore.named('ChatStore').views((self) => ({
  get list() {
    return Array.from(self.dms.values()).sort(
      (a, b) => b.lastSent - a.lastSent
    );
  },
}));
