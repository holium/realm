import { toJS } from 'mobx';
import { flow, Instance, types } from 'mobx-state-tree';
import {
  ChatStore as BaseChatStore,
  ChatMessage as BaseChatMessage,
  Chat as BaseChat,
} from '../../../../core/ship/stores/dms';
import { sendDm } from './api';

const ChatMessage = BaseChatMessage;
export type ChatMessageType = Instance<typeof ChatMessage>;

const Chat = BaseChat.named('Chat')
  .views((self) => ({
    get list() {
      return self.messages.slice().reverse();
    },
  }))
  .actions((self) => ({
    sendDm: flow(function* (toShip: string, content: any) {
      self.loader.set('loading');
      const [response, error] = yield sendDm(toShip, content);
      if (error) self.loader.set('error');
      self.loader.set('loaded');
      console.log('response in client dm store', response);
      return response;
    }),
  }));

export type ChatType = Instance<typeof Chat>;

export const ChatStore = BaseChatStore.named('ChatStore')
  .views((self) => ({}))
  .actions((self) => ({
    sendDm: flow(function* (toShip: string, content: any) {
      const response = yield sendDm(toShip, content);
      console.log(response);
      return response;
    }),
  }));
