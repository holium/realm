import {
  applySnapshot,
  castToSnapshot,
  Instance,
  types,
} from 'mobx-state-tree';
import { toJS } from 'mobx';
import { Patp } from '../../../types';
import { SubscriptionModel } from '../../common.model';
import { cleanNounColor } from '../../../lib/color';

const FriendStatus = types.enumeration('FriendStatus', [
  'fren',
  'follower',
  'following',
  'contact',
]);
export type FriendStatus = Instance<typeof FriendStatus>;

export const ContactModel = types.model('ContactModel', {
  avatar: types.maybeNull(types.string),
  bio: types.maybeNull(types.string),
  color: types.maybeNull(types.string),
  cover: types.maybeNull(types.string),
  // groups: types.maybeNull(types.array(types.string)),
  // 'last-updated': types.maybeNull(types.number),
  nickname: types.maybeNull(types.string),
  status: types.maybeNull(types.string),
});

export type ContactModelType = Instance<typeof ContactModel>;

export const FriendModel = types.model({
  pinned: types.boolean,
  tags: types.optional(types.array(types.string), []),
  status: FriendStatus,
  contactInfo: types.maybeNull(ContactModel),
});

export type FriendType = Instance<typeof FriendModel>;

export const FriendsStore = types
  .model('FriendsStore', {
    all: types.map(FriendModel),
    subscription: types.optional(SubscriptionModel, {
      state: 'subscribing',
    }),
  })
  .views((self) => ({
    get pinned() {
      const list = Array.from(self.all.entries())
        .map((value: [patp: string, friend: FriendType]) => ({
          ...value[1],
          color: cleanNounColor(value[1].contactInfo?.color || ''),
          patp: value[0],
          pinned: value[1].pinned,
          tags: toJS(value[1].tags),
          status: value[1].status,
        }))
        .filter((friend: any) => friend.pinned);
      return list.filter((friend: any) => friend.pinned);
    },
    get unpinned() {
      const list = Array.from(self.all.entries()).map(
        (value: [patp: string, friend: FriendType]) => ({
          ...value[1],
          color: cleanNounColor(value[1].contactInfo?.color || ''),
          patp: value[0],
          pinned: value[1].pinned,
          tags: toJS(value[1].tags),
          status: value[1].status,
        })
      );
      return list.filter((friend: any) => !friend.pinned);
    },
    get list() {
      return Array.from(self.all.entries()).map(
        (value: [patp: string, friend: FriendType]) => ({
          ...value[1],
          color: cleanNounColor(value[1].contactInfo?.color || ''),
          patp: value[0],
          pinned: value[1].pinned,
          tags: toJS(value[1].tags),
          status: value[1].status,
        })
      );
    },
    get subscriptionState() {
      return self.subscription.state;
    },
    getContactAvatarMetadata(patp: string) {
      const contact = self.all.get(patp);
      return {
        patp,
        color: contact?.contactInfo?.color || '#000',
        avatar: contact?.contactInfo?.avatar || '',
        nickname: contact?.contactInfo?.nickname || '',
        bio: contact?.contactInfo?.bio || '',
      };
    },
  }))
  .actions((self) => ({
    setInitial(json: {
      'contact-update': {
        initial?: {
          'is-public': boolean;
          rolodex: { [patp: string]: ContactModelType };
        };
        edit?: any;
      };
    }) {
      // ------------------
      // ---- initial -----
      // ------------------
      if (json['contact-update'].initial) {
        const contactMap = new Map<string, ContactModelType>();
        const contacts = json['contact-update'].initial.rolodex;
        Object.keys(contacts).forEach((patp: string) => {
          const newContact: ContactModelType = contacts[patp];
          contactMap.set(patp, {
            ...newContact,
            color: newContact.color && cleanNounColor(newContact.color),
          });
        });
        self.all.merge(contactMap);
      }
      // ------------------
      // ------ edit ------
      // ------------------
      if (json['contact-update'].edit) {
        // TODO
        // console.log('edit... ', toJS(json['contact-update'].edit));
      }
    },
    initial(friends: typeof self.all) {
      applySnapshot(self.all, castToSnapshot(friends));
    },
    add(patp: Patp, friend: FriendType) {
      self.all.set(patp, friend);
    },
    update(patp: Patp, update: any) {
      self.all.set(patp, update);
    },
    remove(patp: Patp) {
      self.all.delete(patp);
    },
    setSubscriptionStatus: (
      newSubscriptionStatus: 'subscribed' | 'subscribing' | 'unsubscribed'
    ) => {
      self.subscription.set(newSubscriptionStatus);
    },
  }));

export type FriendsType = Instance<typeof FriendsStore>;
