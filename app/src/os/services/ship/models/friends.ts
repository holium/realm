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

export const FriendModel = types.model({
  pinned: types.boolean,
  tags: types.optional(types.array(types.string), []),
  status: FriendStatus,
  nickname: types.string,
  bio: types.string,
  color: types.string,
  avatar: types.maybeNull(types.string),
  cover: types.maybeNull(types.string),
  groups: types.maybeNull(types.array(types.string)),
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
          color: cleanNounColor(value[1].color),
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
          color: cleanNounColor(value[1].color),
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
          color: cleanNounColor(value[1].color),
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
  }))
  .actions((self) => ({
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
