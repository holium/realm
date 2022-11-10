import { toJS } from 'mobx';
import {
  castToSnapshot,
  Instance,
  types,
  detach,
  applySnapshot,
  destroy,
} from 'mobx-state-tree';
import { LoaderModel } from '../../common.model';
import { FriendsStore } from './friends';
// import { NotificationsStore } from './notifications';

export const ShipModel = types
  .model('ShipModel', {
    url: types.string,
    patp: types.identifier,
    nickname: types.maybeNull(types.string),
    color: types.maybeNull(types.string),
    avatar: types.maybeNull(types.string),
    cookie: types.maybeNull(types.string),
    code: types.maybeNull(types.string),
    loggedIn: types.optional(types.boolean, false),
    wallpaper: types.maybeNull(types.string),
    loader: types.optional(LoaderModel, { state: 'initial' }),
    // chat: ChatStore,
    // contacts: ContactStore,
    // docket: DocketStore,
    // notifications: types.optional(NotificationsStore, { more: [] }),
  })
  .views((self) => ({
    get isLoaded() {
      return self.loader.isLoaded;
    },
    get isLoading() {
      return self.loader.isLoading;
    },
    // get apps() {
    //   return Array .from(self.docket.apps.values());
    // },
  }))
  .actions((self) => ({
    initialSync: (syncEffect: {
      key: string;
      model: Instance<typeof self>;
    }) => {
      // Apply persisted snapshot
      applySnapshot(self, castToSnapshot(syncEffect.model));
      self.loader.set('loaded');
      // self.chat.loader.set('loaded');
    },
    setOurMetadata: (metadata: {
      nickname: string;
      color: string;
      avatar: string;
    }) => {
      self.avatar = metadata.avatar;
      self.nickname = metadata.nickname;
      self.color = metadata.color;
    },
    // setDMs: (ship: string, dmGraph: any) => {
    //   const strippedShip = ship.substring(1);
    //   const dmMap = new Map<string, ChatType>();
    //   Object.values(dmGraph).forEach((chat: any) => {
    //     let lastSent = 0;
    //     const dmContacts: string[] = [];
    //     const messages: ChatMessageType[] = [];
    //     Object.values(chat.children).forEach(({ post }: any) => {
    //       if (!post.author) {
    //         // handles cases of no author?
    //         return;
    //       }
    //       if (
    //         post.author !== strippedShip &&
    //         !dmContacts.includes(post.author)
    //       ) {
    //         dmContacts.push(post.author);
    //       }
    //       if (post['time-sent'] > lastSent) {
    //         lastSent = post['time-sent'];
    //       }
    //       post.contents.forEach((content: any) => {
    //         const type = Object.keys(content)[0];
    //         let string: any = content[type];
    //         if (type === 'code') {
    //           string = string;
    //         }
    //         messages.push(
    //           ChatMessage.create({
    //             type,
    //             author: post.author,
    //             timeSent: post['time-sent'],
    //             // @ts-expect-error suck it
    //             content: { [type]: string },
    //             position: post.author !== strippedShip ? 'left' : 'right',
    //           })
    //         );
    //       });
    //     });
    //     const contact = dmContacts.join(',');
    //     messages.sort((a, b) => b.timeSent - a.timeSent);
    //     if (contact) {
    //       // TODO get the name of an non-responsive user another way
    //       // applySnapshot()
    //       dmMap.set(contact, Chat.create({ contact, lastSent, messages }));
    //     }
    //   });
    //   // console.log(dmGraph);
    //   self.chat = ChatStore.create(
    //     castToSnapshot({ loader: { state: 'loaded' }, dms: dmMap })
    //   );
    // },
  }));

export type ShipModelType = Instance<typeof ShipModel>;

export const ShipStore = types
  .model({
    current: types.safeReference(ShipModel),
    ships: types.map(ShipModel),
  })
  .actions((self) => ({
    setNewShip(newShip: ShipModelType) {
      self.ships.set(newShip.patp, newShip);
    },
    deleteShip(patp: string) {
      destroy(self.ships.get(patp));
    },
  }));

export type ShipStoreType = Instance<typeof ShipStore>;
