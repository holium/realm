import {
  applySnapshot,
  castToSnapshot,
  Instance,
  types,
} from 'mobx-state-tree';
import { toJS } from 'mobx';
import { Patp } from '../../../types';

export const FriendModel = types.model({
  pinned: types.boolean,
  tags: types.optional(types.array(types.string), []),
  mutual: types.boolean,
});

export type FriendType = Instance<typeof FriendModel>;

export const FriendsStore = types
  .model('FriendsStore', { all: types.map(FriendModel) })
  .views((self) => ({
    get pinned() {
      const list = Array.from(self.all.entries())
        .map((value: [patp: string, friend: FriendType]) => ({
          patp: value[0],
          pinned: value[1].pinned,
          tags: toJS(value[1].tags),
          mutual: value[1].mutual,
        }))
        .filter((friend: any) => friend.pinned);
      return list.filter((friend: any) => friend.pinned);
    },
    get unpinned() {
      const list = Array.from(self.all.entries()).map(
        (value: [patp: string, friend: FriendType]) => ({
          patp: value[0],
          pinned: value[1].pinned,
          tags: toJS(value[1].tags),
          mutual: value[1].mutual,
        })
      );
      return list.filter((friend: any) => !friend.pinned);
    },
    get list() {
      return Array.from(self.all.entries()).map(
        (value: [patp: string, friend: FriendType]) => ({
          patp: value[0],
          pinned: value[1].pinned,
          tags: toJS(value[1].tags),
          mutual: value[1].mutual,
        })
      );
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
  }));

export type FriendsType = Instance<typeof FriendsStore>;
