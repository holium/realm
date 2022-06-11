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
} from '../../../renderer/logic/ship/chat/api';
import { LoaderModel } from '../../../renderer/logic/stores/common/loader';
import { ShipModelType, ShipModel } from './ship';
import { patp2dec } from 'urbit-ob';
import { PostType } from '../types';

const MessagePosition = types.enumeration(['right', 'left']);

export const ChatMessage = types.union(
  { eager: false },
  types.model({
    type: 'text',
    // index: types.maybe(types.string),
    pending: types.optional(types.boolean, false),
    position: MessagePosition,
    timeSent: types.number,
    author: types.string,
    content: types.model({ text: types.string }),
  }),
  types.model({
    type: 'url',
    // index: types.maybe(types.string),
    pending: types.optional(types.boolean, false),
    position: MessagePosition,
    timeSent: types.number,
    author: types.string,
    content: types.model({ url: types.string }),
  }),
  types.model({
    type: 'mention',
    // index: types.maybe(types.string),
    pending: types.optional(types.boolean, false),
    position: MessagePosition,
    author: types.string,
    timeSent: types.number,
    content: types.model({ mention: types.string }),
  }),
  types.model({
    type: 'code',
    // index: types.maybe(types.string),
    pending: types.optional(types.boolean, false),
    position: MessagePosition,
    author: types.string,
    timeSent: types.number,
    content: types.model({ code: types.model({ expression: types.string }) }),
  }),
  types.model({
    type: 'reference',
    // index: types.maybe(types.string),
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
    contact: types.string,
    sigilColor: types.maybeNull(types.string),
    avatar: types.maybeNull(types.string),
    lastSent: types.optional(types.number, 0),
    pending: types.optional(types.boolean, false),
    messages: types.optional(types.array(ChatMessage), []),
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
      post.contents.forEach((content: any) => {
        const type = Object.keys(content)[0];
        let string: any = content[type];
        if (type === 'code') {
          string = string;
        }
        self.messages.unshift(
          ChatMessage.create({
            type,
            author: post.author,
            timeSent: post['time-sent'],
            // @ts-expect-error
            content: { [type]: string },
            position: post.author !== strippedShip ? 'left' : 'right',
          })
        );
      });
    },
    sendDm: flow(function* (content: any) {
      self.loader.set('loading');
      const ship: ShipModelType = getParent(self, 3);
      const author = ship.patp.substring(1);
      const post = createPost(
        author,
        content,
        `/${patp2dec(`~${self.contact}`)}`
      );
      console.log('sending dm from ', author, post.author);
      // const type: string = Object(content[0]).keys()[0];
      // Insert pending dm
      // TODO consolidate this
      post.contents.forEach((content: any) => {
        const type = Object.keys(content)[0];
        let string: any = content[type];
        if (type === 'code') {
          string = string;
        }
        self.messages.unshift(
          ChatMessage.create({
            type,
            author: author,
            pending: true,
            timeSent: post['time-sent'],
            // @ts-expect-error
            content: { [type]: string },
            position: 'right',
          })
        );
      });
      const [response, error] = yield sendDm(self.contact, content);
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
    setPendingDms: (pendings: string[]) => {
      pendings.forEach((pendingDm: string) => {
        self.dms.set(
          pendingDm,
          Chat.create({ contact: pendingDm, pending: true, messages: [] })
        );
      });
    },
    setDMs: (ship: string, dmGraph: any) => {
      const strippedShip = ship.substring(1);
      Object.values(dmGraph).forEach((chat: any) => {
        let lastSent = 0;
        const dmContacts: string[] = [];
        const messages: ChatMessageType[] = [];
        Object.values(chat.children).forEach(({ post }: any) => {
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
          post.contents.forEach((content: any) => {
            const type = Object.keys(content)[0];
            let string: any = content[type];
            if (type === 'code') {
              string = string;
            }

            messages.push(
              ChatMessage.create({
                type,
                author: post.author,
                timeSent: post['time-sent'],
                // @ts-expect-error
                content: { [type]: string },
                position: post.author !== strippedShip ? 'left' : 'right',
              })
            );
          });
        });
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
                contact,
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
