import { toJS } from 'mobx';
import {
  applySnapshot,
  castToSnapshot,
  flow,
  Instance,
  types,
} from 'mobx-state-tree';
import { LoaderModel } from '../../../renderer/logic/stores/common/loader';
import { ContactStore } from './contacts';

const MessagePosition = types.enumeration(['right', 'left']);

export const ChatMessage = types.union(
  { eager: false },
  types.model({
    type: 'text',
    position: MessagePosition,
    timeSent: types.number,
    author: types.string,
    content: types.model({ text: types.string }),
  }),
  types.model({
    type: 'url',
    position: MessagePosition,
    timeSent: types.number,
    author: types.string,
    content: types.model({ url: types.string }),
  }),
  types.model({
    type: 'mention',
    position: MessagePosition,
    author: types.string,
    timeSent: types.number,
    content: types.model({ mention: types.string }),
  }),
  types.model({
    type: 'code',
    position: MessagePosition,
    author: types.string,
    timeSent: types.number,
    content: types.model({ code: types.model({ expression: types.string }) }),
  }),
  types.model({
    type: 'reference',
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
    lastSent: types.number,
    messages: types.optional(types.array(ChatMessage), []),
  })
  .views((self) => ({
    get list() {
      return self.messages.slice().reverse();
    },
  }));

export type ChatType = Instance<typeof Chat>;

export const ChatStore = types
  .model({
    dms: types.map(Chat),
    loader: types.optional(LoaderModel, { state: 'initial' }),
  })
  .views((self) => ({
    get list() {
      return Array.from(self.dms.values()).sort(
        (a, b) => b.lastSent - a.lastSent
      );
    },
  }))
  .actions((self) => ({
    setDMs: (ship: string, dmGraph: any) => {
      const strippedShip = ship.substring(1);
      // console.log(response);
      // const dmGraph = response['graph-update']['add-graph']['graph'];
      // console.log(dmGraph);
      const dmMap: { [key: string]: ChatType } = {};
      Object.values(dmGraph).forEach((chat: any) => {
        let lastSent = 0;
        const dmContacts: string[] = [];
        // const dm
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
                // @ts-expect-error suck it
                content: { [type]: string },
                position: post.author !== strippedShip ? 'left' : 'right',
              })
            );
          });
        });
        const contact = dmContacts.join(',');
        messages.sort((a, b) => b.timeSent - a.timeSent);
        if (contact) {
          // TODO get the name of an non-responsive user another way
          dmMap[contact] = Chat.create({ contact, lastSent, messages });
          // self.dms.set(contact, Chat.create({ contact, lastSent, messages }));
        }
      });

      applySnapshot(self.dms, dmMap);
    },
  }));
