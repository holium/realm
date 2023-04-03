import {
  applySnapshot,
  castToSnapshot,
  Instance,
  types,
  flow,
} from 'mobx-state-tree';
import { FriendsIPC } from '../ipc';

const FriendStatus = types.enumeration('FriendStatus', [
  'fren',
  'follower',
  'following',
  'contact',
  'our',
]);
export type FriendStatus = Instance<typeof FriendStatus>;

export const FriendModel = types.model({
  patp: types.identifier,
  pinned: types.boolean,
  tags: types.optional(types.array(types.string), []),
  status: FriendStatus,
  nickname: types.maybeNull(types.string),
  avatar: types.maybeNull(types.string),
  bio: types.maybeNull(types.string),
  color: types.maybeNull(types.string),
  cover: types.maybeNull(types.string),
});

export type FriendType = Instance<typeof FriendModel>;

export const FriendsStore = types
  .model('FriendsStore', {
    all: types.array(FriendModel),
  })
  .views((self) => ({
    get pinned() {
      const list = self.all
        .filter((friend: any) => friend.status !== 'contact')
        .filter((friend: any) => friend.pinned);
      return list.filter((friend: any) => friend.pinned);
    },
    get unpinned() {
      return self.all
        .filter((friend: any) => friend.status !== 'contact')
        .filter((friend: any) => !friend.pinned && !(friend.status === 'our'));
    },
    get list() {
      return self.all.filter((friend: any) => friend.status !== 'contact');
    },
    get search(): [string, FriendType][] {
      const filtered = self.all.filter(
        (friend: FriendType) => friend.patp !== window.ship
      );
      return filtered.map((friend: FriendType) => [
        friend.patp,
        friend || { color: '#000', avatar: '', nickname: '' },
      ]);
    },
    // get contacts(): [string, ContactModelType][] {
    //   const filtered = Array.from(self.all.entries()).filter(
    //     (value: [patp: string, friend: FriendType]) =>
    //       value[1].contactInfo !== null
    //   );
    //   return filtered.map((value: [patp: string, friend: any]) => [
    //     value[0],
    //     value[1].contactInfo,
    //   ]);
    // },
    getContactAvatarMetadata(patp: string) {
      const contact = self.all.find((f) => f.patp === patp);
      return {
        patp,
        color: (contact && contact.color) || '#000',
        avatar: contact?.avatar || '',
        nickname: contact?.nickname || '',
        bio: contact?.bio || '',
      };
    },
  }))
  .actions((self) => ({
    init: flow(function* () {
      try {
        const friends = yield FriendsIPC.getFriends() as Promise<any>;
        self.all = friends;
      } catch (error) {
        console.error(error);
      }
    }),
    initial(friends: typeof self.all) {
      applySnapshot(self.all, castToSnapshot(friends));
    },
    add(patp: string, friend: FriendType) {
      self.all.push(friend);
    },
    update(patp: string, update: any) {
      const replace = self.all.findIndex((f) => patp === f.patp);
      if (replace !== -1) {
        self.all[replace] = {
          ...self.all[replace],
          ...update,
        };
      }
    },
    remove(patp: string) {
      const delIdx = self.all.findIndex((f) => patp === f.patp);
      if (delIdx !== -1) {
        self.all.splice(delIdx, 1);
      }
    },
  }));

export type FriendsType = Instance<typeof FriendsStore>;
