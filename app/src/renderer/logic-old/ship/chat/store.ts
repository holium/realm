import { flow, Instance, types } from 'mobx-state-tree';
import {
  ChatStore as BaseChatStore,
  ChatMessage as BaseChatMessage,
  Chat as BaseChat,
} from '../../../../core-a/ship/stores/dms';
// import { acceptDm, declineDm, sendDm, setScreen } from './api';

const ChatMessage = BaseChatMessage;
export type ChatMessageType = Instance<typeof ChatMessage>;

const Chat = BaseChat.named('Chat').views((self) => ({
  get list() {
    return self.messages.slice().reverse();
  },
}));

export type ChatType = Instance<typeof Chat>;

export const ChatStore = BaseChatStore.named('ChatStore')
  .views((self) => ({}))
  .actions((self) => ({
    // sendDm: flow(function* (toShip: string, content: any) {
    //   const response = yield sendDm(toShip, content);
    //   console.log(response);
    //   return response;
    // }),
  }));
