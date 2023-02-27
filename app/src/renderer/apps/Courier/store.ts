import { createContext, useContext } from 'react';
import { toJS } from 'mobx';
import { flow, Instance, types } from 'mobx-state-tree';
import { ChatDBActions } from 'renderer/logic/actions/chat-db';

type Subroutes = 'inbox' | 'chat' | 'new' | 'chat-info';

const ChatMetadataModel = types.model({
  title: types.string,
  description: types.maybe(types.string),
  image: types.maybe(types.string),
  creator: types.string,
  timestamp: types.string,
  reactions: types.optional(types.boolean, true),
});

export type ChatMetadata = Instance<typeof ChatMetadataModel>;

const stringifyMetadata = (metadata: ChatMetadata) => {
  return {
    ...toJS(metadata),
    reactions: metadata.reactions.toString(),
  };
};

const CourierAppModel = types
  .model('CourierAppModel', {
    subroute: types.optional(
      types.enumeration<Subroutes>(['inbox', 'new', 'chat', 'chat-info']),
      'inbox'
    ),
    selectedPath: types.maybe(types.string),
    title: types.maybe(types.string),
    peers: types.maybe(types.array(types.string)),
    peersGetBacklog: types.boolean,
    type: types.maybe(types.enumeration(['dm', 'group', 'space'])),
    metadata: types.maybe(ChatMetadataModel),
  })
  .actions((self) => ({
    setSubroute(subroute: Subroutes) {
      if (subroute === 'inbox') {
        self.selectedPath = undefined;
        self.title = undefined;
        self.type = undefined;
        self.peers = undefined;
        self.metadata = undefined;
      }
      self.subroute = subroute;
    },
    setChat(
      path: string,
      title: string,
      type: 'dm' | 'group' | 'space',
      peers: string[],
      metadata: any,
      peersGetBacklog: boolean
    ) {
      self.selectedPath = path;
      self.title = title;
      self.type = type;
      self.peers = peers as typeof self.peers;
      self.subroute = 'chat';
      self.peersGetBacklog = peersGetBacklog;
      self.metadata = ChatMetadataModel.create(metadata);
    },
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
        throw new Error('Failed to create chat');
      }
    }),
    updateMetadata: flow(function* (update: ChatMetadata) {
      if (!self.selectedPath) return;
      const oldMetadata = self.metadata;
      self.metadata = ChatMetadataModel.create(update);
      try {
        yield ChatDBActions.editChat(
          self.selectedPath,
          stringifyMetadata(update),
          self.peersGetBacklog
        );
      } catch (e) {
        console.error(e);
        self.metadata = oldMetadata;
      }
    }),
    updatePeersGetBacklog: flow(function* (peersGetBacklog: boolean) {
      if (!self.selectedPath || !self.metadata) return;
      const oldPeerGetBacklog = self.peersGetBacklog;
      self.peersGetBacklog = peersGetBacklog;
      try {
        yield ChatDBActions.editChat(
          self.selectedPath,
          stringifyMetadata(self.metadata),
          peersGetBacklog
        );
      } catch (e) {
        console.error(e);
        self.peersGetBacklog = oldPeerGetBacklog;
      }
    }),
  }));

export const chatStore = CourierAppModel.create({
  subroute: 'inbox',
  selectedPath: undefined,
  peersGetBacklog: true,
});

// -------------------------------
// Create core context
// -------------------------------
type CourierAppInstance = Instance<typeof CourierAppModel>;
export const CourierAppContext = createContext<null | CourierAppInstance>(
  chatStore
);

export const ChatProvider = CourierAppContext.Provider;
export function useChatStore() {
  const store = useContext(CourierAppContext);
  if (store === null) {
    throw new Error('Store cannot be null, please add a context provider');
  }
  return store;
}
