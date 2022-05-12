import { toJS } from 'mobx';
import {
  applySnapshot,
  castToSnapshot,
  Instance,
  types,
} from 'mobx-state-tree';
import { WindowThemeModel } from '../../../renderer/logic/stores/config';
import { LoaderModel } from '../../../renderer/logic/stores/common/loader';
import { Chat, ChatMessage, ChatMessageType, ChatStore, ChatType } from './dms';
import { ContactStore } from './contacts';
import { DocketStore } from './docket';
import { ThemeStore } from '../../../renderer/logic/theme/store';

export const ShipModel = types
  .model('ShipModel', {
    url: types.string,
    patp: types.identifier,
    nickname: types.maybeNull(types.string),
    color: types.maybeNull(types.string),
    avatar: types.maybeNull(types.string),
    cookie: types.maybeNull(types.string),
    theme: ThemeStore,
    loggedIn: types.optional(types.boolean, false),
    wallpaper: types.maybeNull(types.string),
    loader: types.optional(LoaderModel, { state: 'initial' }),
    chat: ChatStore,
    contacts: ContactStore,
    docket: DocketStore,
  })
  .actions((self) => ({
    setDMs: (ship: string, dmGraph: any) => {
      const strippedShip = ship.substring(1);
      // console.log(response);
      // const dmGraph = response['graph-update']['add-graph']['graph'];
      // console.log(dmGraph);
      const dmMap = new Map<string, ChatType>();
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
          // applySnapshot()
          dmMap.set(contact, Chat.create({ contact, lastSent, messages }));
        }
      });
      // console.log(dmGraph);
      self.chat = ChatStore.create(
        castToSnapshot({ loader: { state: 'loaded' }, dms: dmMap })
      );
    },
  }));

export type ShipModelType = Instance<typeof ShipModel>;
