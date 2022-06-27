import { createPost } from '@urbit/api';
import { toJS } from 'mobx';
import {
  getParent,
  flow,
  Instance,
  types,
  getParentOfType,
} from 'mobx-state-tree';
import {
  acceptDm,
  declineDm,
  sendDm,
  setScreen,
} from '../../../renderer/logic-old/ship/chat/api';
import { LoaderModel } from '../../../renderer/logic-old/stores/common/loader';
import { ShipModelType, ShipModel } from './ship';
import { patp2dec, patp } from 'urbit-ob';
import { PostType } from '../types';

const MessagePosition = types.enumeration(['right', 'left']);

export const MessageContent = types.union(
  { eager: true },
  types.model('ContentText', { text: types.string }),
  types.model('ContentUrl', { url: types.string }),
  types.model('ContentMention', { mention: types.string }),
  types.model('ContentCode', {
    code: types.model({ expression: types.string }),
  }),
  types.model('ContentReference', {
    reference: types.string,
  }),
  types.model('ContentGroupReference', {
    reference: types.model({
      group: types.string,
    }),
  }),
  types.model('ContentAppReference', {
    reference: types.model({
      app: types.model({
        desk: types.string,
        ship: types.string,
        path: types.string,
      }),
    }),
  }),
  types.model('ContentGraphReference', {
    reference: types.model({
      graph: types.model({
        graph: types.string,
        group: types.string,
        index: types.string,
      }),
    }),
  })
);

export const NewChatMessage = types.model({
  index: types.maybe(types.string),
  pending: types.optional(types.boolean, false),
  position: MessagePosition,
  timeSent: types.number,
  author: types.string,
  contents: types.array(MessageContent),
});

export type NewChatMessageType = Instance<typeof NewChatMessage>;

export const ChatMessage = types.union(
  { eager: false },
  types.model({
    type: 'text',
    index: types.maybe(types.string),
    pending: types.optional(types.boolean, false),
    position: MessagePosition,
    timeSent: types.number,
    author: types.string,
    content: types.model({ text: types.string }),
  }),
  types.model({
    type: 'url',
    index: types.maybe(types.string),
    pending: types.optional(types.boolean, false),
    position: MessagePosition,
    timeSent: types.number,
    author: types.string,
    content: types.model({ url: types.string }),
  }),
  types.model({
    type: 'mention',
    index: types.maybe(types.string),
    pending: types.optional(types.boolean, false),
    position: MessagePosition,
    author: types.string,
    timeSent: types.number,
    content: types.model({ mention: types.string }),
  }),
  types.model({
    type: 'code',
    index: types.maybe(types.string),
    pending: types.optional(types.boolean, false),
    position: MessagePosition,
    author: types.string,
    timeSent: types.number,
    content: types.model({ code: types.model({ expression: types.string }) }),
  }),
  types.model({
    type: 'reference',
    index: types.maybe(types.string),
    pending: types.optional(types.boolean, false),
    position: MessagePosition,
    author: types.string,
    timeSent: types.number,
    content: types.union(
      types.model({
        reference: types.string,
      }),
      types.model({
        reference: types.model({
          group: types.string,
        }),
      }),
      types.model({
        reference: types.model({
          app: types.model({
            desk: types.string,
            ship: types.string,
            path: types.string,
          }),
        }),
      }),
      types.model({
        reference: types.model({
          graph: types.model({
            graph: types.string,
            group: types.string,
            index: types.string,
          }),
        }),
      })
    ),
  })
);
export type ChatMessageType = Instance<typeof ChatMessage>;

export const Chat = types
  .model({
    id: types.maybe(types.string),
    contact: types.string,
    sigilColor: types.maybeNull(types.string),
    avatar: types.maybeNull(types.string),
    lastSent: types.optional(types.number, 0),
    pending: types.optional(types.boolean, false),
    messages: types.optional(types.array(NewChatMessage), []),
    loader: types.optional(LoaderModel, { state: 'initial' }),
  })
  .views((self) => ({
    get list() {
      return self.messages.slice().reverse();
    },
  }))
  .actions((self) => ({
    setDm: (post: PostType) => {
      const ship: ShipModelType = getParent(self, 3);
      let lastSent = 0;
      const strippedShip = ship.patp.substring(1);
      const dmContacts: string[] = [];

      if (!post.author) {
        // handles cases of no author?
        return;
      }
      if (post.author !== strippedShip && !dmContacts.includes(post.author)) {
        dmContacts.push(post.author);
      }
      if (post['time-sent'] > lastSent) {
        lastSent = post['time-sent'];
      }
      self.messages.unshift(
        NewChatMessage.create({
          index: post.index,
          pending: false,
          author: post.author,
          timeSent: post['time-sent'],
          contents: post.contents,
          position: post.author !== strippedShip ? 'left' : 'right',
        })
      );
    },
    sendDm: flow(function* (contents: any) {
      self.loader.set('loading');
      const ship: ShipModelType = getParent(self, 3);
      const author = ship.patp.substring(1);
      const post = createPost(
        author,
        contents,
        `/${patp2dec(`~${self.contact}`)}`
      );
      console.log('sending dm from ', author, post.author);
      // const type: string = Object(content[0]).keys()[0];
      // Insert pending dm
      self.messages.unshift(
        NewChatMessage.create({
          index: post.index,
          author: author,
          pending: true,
          timeSent: post['time-sent'],
          // @ts-expect-error
          contents: post.contents,
          position: 'right',
        })
      );
      const [response, error] = yield sendDm(self.contact, contents);
      if (error) self.loader.set('error');
      self.loader.set('loaded');
      console.log('response in client dm store', response);
      return response;
    }),
    acceptDm: flow(function* () {
      self.loader.set('loading');
      const [response, error] = yield acceptDm(self.contact);
      if (error) self.loader.set('error');
      self.loader.set('loaded');
      console.log('response in client dm store', response);
      return response;
    }),
    declineDm: flow(function* () {
      self.loader.set('loading');
      const [response, error] = yield declineDm(self.contact);
      if (error) self.loader.set('error');
      self.loader.set('loaded');
      console.log('response in client dm store', response);
      return response;
    }),
    setScreen: flow(function* (screen: boolean) {
      self.loader.set('loading');
      const [response, error] = yield setScreen(screen);
      if (error) self.loader.set('error');
      self.loader.set('loaded');
      console.log('response in client dm store', response);
      return response;
    }),
  }));

export type ChatType = Instance<typeof Chat>;

export const ChatStore = types
  .model({
    dms: types.map(Chat),
    loader: types.optional(LoaderModel, { state: 'initial' }),
  })
  .views((self) => ({
    get list() {
      return Array.from(self.dms.values()).sort((a, b) => {
        // @ts-ignore
        return b.pending - a.pending || b.lastSent - a.lastSent;
      });
    },
  }))
  .actions((self) => ({
    sendNewDm: (contacts: string[], metadata: any) => {
      const chatContacts = contacts.join(',');

      const newChat = Chat.create({
        contact: chatContacts,
        sigilColor: metadata.color || '#000000',
        avatar: metadata.avatar,
        lastSent: new Date().getTime(),
        messages: [],
      });

      self.dms.set(chatContacts, newChat);
      return self.dms.get(chatContacts);
    },
    setPendingDms: (pendings: string[]) => {
      pendings.forEach((pendingDm: string) => {
        self.dms.set(
          pendingDm,
          Chat.create({ contact: pendingDm, pending: true, messages: [] })
        );
      });
    },
    // TODO clean up how contact names are derived
    setDMs: (ship: string, dmGraph: any) => {
      const strippedShip = ship.substring(1);
      // console.log(dmGraph);
      Object.entries(dmGraph).forEach((chat: [string, any]) => {
        let lastSent = 0;
        const id = chat[0];
        const patpContact: string = patp(id).substring(1);
        const dmContacts: string[] = [patpContact];
        const messages: NewChatMessageType[] = [];
        Object.entries(chat[1].children).forEach(
          ([index, { post }]: [string, any]) => {
            if (!post.author) {
              // handles cases of no author?
              return;
            }
            if (
              post.author !== strippedShip &&
              !dmContacts.includes(post.author)
            ) {
              dmContacts.push(post.author);
            }
            if (post['time-sent'] > lastSent) {
              lastSent = post['time-sent'];
            }

            messages.push(
              NewChatMessage.create({
                index,
                author: post.author,
                timeSent: post['time-sent'],
                contents: post.contents,
                position: post.author !== strippedShip ? 'left' : 'right',
              })
            );
          }
        );
        const contact = dmContacts.join(',');
        messages.sort((a, b) => b.timeSent - a.timeSent);
        if (contact) {
          if (dmContacts.length === 1) {
            // get contact avatar info
            const avatarMetadata = getParentOfType(
              self,
              ShipModel
            ).contacts.getContactAvatarMetadata(`~${contact}`);
            // Set chat data
            self.dms.set(
              contact,
              Chat.create({
                id,
                contact: patp(id).substring(1) || contact,
                sigilColor: avatarMetadata.color,
                avatar: avatarMetadata.avatar,
                lastSent,
                messages,
              })
            );
          } else {
            // TODO handle group dms here
            // TODO get the name of an non-responsive user another way
            self.dms.set(contact, Chat.create({ contact, lastSent, messages }));
          }
        }
      });
    },
  }));

// DM codebase from @urbit/api
const acceptDM = {
  app: 'dm-hook',
  mark: 'dm-hook-action',
  json: {
    accept: '~zod',
  },
};

const declineDM = {
  app: 'dm-hook',
  mark: 'dm-hook-action',
  json: {
    decline: '~zod',
  },
};

const removeDM = {
  app: 'graph-store',
  mark: `graph-update-0`,
  json: {
    'remove-posts': {
      resource: { ship: '~zod', name: 'dm-inbox' },
      indices: ['10'], // index: string
    },
  },
};

const sendDM = {
  app: 'dm-hook',
  mark: `graph-update-3`,
  json: {
    'add-nodes': {
      resource: { ship: '~zod', name: 'dm-inbox' },
      nodes: {
        ['11']: {
          post: {
            author: '~zod',
            index: 0 + '/' + 11,
            'time-sent': Date.now(),
            contents: [],
            hash: null,
            signatures: [],
          },
          children: null,
        },
      },
    },
  },
};
export const setScreenType = {
  app: 'dm-hook',
  mark: 'dm-hook-action',
  json: { screen: false },
};

// const dmAction = <T>(data: T): Poke<T> => ({
// app: 'dm-hook',
// mark: 'dm-hook-action',
// json: data,
// });

// /**
//  * Accept a pending DM request
//  *
//  * @param ship the ship to accept
//  */
// export const acceptDm = (ship: string) => dmAction({
//   accept: ship
// });

// /**
//  * Decline a pending DM request
//  *
//  * @param ship the ship to accept
//  */
// export const declineDm = (ship: string) => dmAction({
//   decline: ship
// });

// /**
//  * Remove a DM message from our inbox
//  *
//  * @remarks
//  * This does not remove the message from the recipients inbox
//  */
// export const removeDmMessage = (
//   our: Patp,
//   index: string
// ): Poke<any> => ({
// app: 'graph-store',
// mark: `graph-update-${GRAPH_UPDATE_VERSION}`,
// json: {
//   'remove-posts': {
//     resource: { ship: our, name: 'dm-inbox' },
//     indices: [index]
//   }
// }
// });

// /**
//  * Send a DM to a ship
//  *
//  * @param our sender
//  * @param ship recipient
//  * @param contents contents of message
//  */
// export const addDmMessage = (our: PatpNoSig, ship: Patp, contents: Content[]): Poke<any> => {
// const post = createPost(our, contents, `/${patp2dec(ship)}`);
// const node: GraphNode = {
//   post,
//   children: null
// };
// return {
// app: 'dm-hook',
// mark: `graph-update-${GRAPH_UPDATE_VERSION}`,
//   json: {
// 'add-nodes': {
//   resource: { ship: `~${our}`, name: 'dm-inbox' },
//   nodes: {
//     [post.index]: node
//   }
// }
//   }
// };
// };

// export const createPost = (
//   ship: PatpNoSig,
//   contents: Content[],
//   parentIndex = '',
//   childIndex = 'DATE_PLACEHOLDER'
// ): Post => {
//   if (childIndex === 'DATE_PLACEHOLDER') {
//     childIndex = unixToDa(Date.now()).toString();
//   }
// return {
//   author: `~${ship}`,
//   index: parentIndex + '/' + childIndex,
//   'time-sent': Date.now(),
//   contents,
//   hash: null,
//   signatures: [],
// };
// };

// Content and graph-store types
// export interface TextContent {
//   text: string;
// }
// export interface UrlContent {
//   url: string;
// }
// export interface CodeContent {
//   code: {
//     expression: string;
//     output: string[] | undefined;
//   };
// }

// export interface ReferenceContent {
//   reference: AppReference | GraphReference | GroupReference;
// }

// export interface GraphReference {
//   graph: {
//     graph: string;
//     group: string;
//     index: string;
//   };
// }

// export interface GroupReference {
//   group: string;
// }

// export interface AppReference {
//   app: {
//     ship: string;
//     desk: string;
//     path: string;
//   };
// }

// export interface MentionContent {
//   mention: string;
//   emphasis?: 'bold' | 'italic';
// }
// export type Content =
//   | TextContent
//   | UrlContent
//   | CodeContent
//   | ReferenceContent
//   | MentionContent;

// export interface Post {
//   author: Patp;
//   contents: Content[];
//   hash: string | null;
//   index: string;
//   pending?: boolean;
//   signatures: string[];
//   'time-sent': number;
// }

// export interface GraphNodePoke {
//   post: Post;
//   children: GraphChildrenPoke | null;
// }

// export interface GraphChildrenPoke {
//   [k: string]: GraphNodePoke;
// }

// export interface GraphNode {
//   children: Graph | null;
//   post: Post;
// }

// export interface FlatGraphNode {
//   children: null;
//   post: Post;
// }

// export type Graph = BigIntOrderedMap<GraphNode>;

// export type Graphs = { [rid: string]: Graph };

// export type FlatGraph = BigIntArrayOrderedMap<FlatGraphNode>;

// export type FlatGraphs = { [rid: string]: FlatGraph };

// export type ThreadGraphs = {
//   [rid: string]: {
//     [index: string]: FlatGraph;
//   };
// };
