import { createPost } from '@urbit/api';
import { toJS } from 'mobx';
import {
  getParent,
  flow,
  Instance,
  types,
  getParentOfType,
} from 'mobx-state-tree';
import { LoaderModel } from '../../common.model';
import { ShipModelType, ShipModel } from './ship';
import { patp2dec, patp } from 'urbit-ob';
import { Patp, PostType } from '../../../types';

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
  .model('Chat', {
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
    setDm: (ship: string, post: PostType) => {
      let lastSent = 0;
      const dmContacts: string[] = [];

      if (!post.author) {
        // handles cases of no author?
        return;
      }
      if (post.author !== ship && !dmContacts.includes(post.author)) {
        dmContacts.push(post.author);
      }
      if (post['time-sent'] > lastSent) {
        lastSent = post['time-sent'];
      }
      self.messages.unshift(
        NewChatMessage.create({
          index: post.index,
          pending: true,
          author: post.author,
          timeSent: post['time-sent'],
          contents: post.contents,
          position: post.author !== ship ? 'left' : 'right',
        })
      );
    },
    sendDm(patp: string, contents: any) {
      self.loader.set('loading');
      const author = patp.substring(1);
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
      // const [response, error] = yield sendDm(self.contact, contents);
      // if (error) self.loader.set('error');
      self.loader.set('loaded');
      // console.log('response in client dm store', response);
      // return response;
    },
    acceptDm() {
      self.loader.set('loading');
      self.loader.set('loaded');
      console.log('response in client dm store');
      return null;
    },
    declineDm: flow(function* () {
      self.loader.set('loading');
      self.loader.set('loaded');
      console.log('decline in client dm store');
      return null;
    }),
    setScreen: flow(function* (screen: boolean) {
      self.loader.set('loading');
      self.loader.set('loaded');
      console.log('set screen');
      return null;
    }),
  }));

export type ChatType = Instance<typeof Chat>;

export const ChatStore = types
  .model('ChatStore', {
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
    setDMs: (ship: string, dmGraph: any, contactsModel: any) => {
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
            const avatarMetadata = contactsModel.getContactAvatarMetadata(
              `~${contact}`
            );
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

export type ChatStoreType = Instance<typeof ChatStore>;
