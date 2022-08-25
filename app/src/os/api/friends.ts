import { ShipModelType } from './../services/ship/models/ship';
import { Urbit } from './../urbit/api';
import { FriendsType } from '../services/ship/models/friends';
import { Patp } from '../types';
import { applySnapshot, castToSnapshot } from 'mobx-state-tree';
import { Conduit } from '../urbit/api-2';

export const FriendsApi = {
  /**
   * getFriends: returns a map of friends
   *
   * @param conduit the conduit instance
   * @returns Promise<{ [patp: Patp]: FriendsType }>
   */
  getFriends: async (
    conduit: Urbit
  ): Promise<{ [patp: Patp]: FriendsType }> => {
    const response = await conduit.scry({
      app: 'friends',
      path: '/all', // the spaces scry is at the root of the path
    });
    return response.friends;
  },
  /**
   * addFriend: adds a friend to our friends list
   *
   * @param conduit the conduit instance
   * @param patp  i.e. ~zod, ~lomder-librun
   * @returns
   */
  addFriend: async (conduit: Urbit, patp: Patp) => {
    const response = await conduit.poke({
      app: 'friends',
      mark: 'friends-action',
      json: {
        'add-friend': {
          ship: patp,
        },
      },
    });
    return response;
  },
  /**
   * editFriend: modifies the content of a friend
   *
   * @param conduit the conduit instance
   * @param patp  i.e. ~zod, ~lomder-librun
   * @param payload the friend edit contract
   * @returns
   */
  editFriend: async (
    conduit: Urbit,
    patp: Patp,
    payload: { pinned: boolean; tags: string[] }
  ) => {
    const response = await conduit.poke({
      app: 'friends',
      mark: 'friends-action',
      json: {
        'edit-friend': {
          ship: patp,
          pinned: payload.pinned,
          tags: payload.tags || [],
        },
      },
    });
    return response;
  },
  /**
   * removeFriend: removes a friend from your friends list
   *
   * @param conduit the conduit instance
   * @param patp  i.e. ~zod, ~lomder-librun
   * @returns
   */
  removeFriend: async (conduit: Urbit, patp: Patp) => {
    const response = await conduit.poke({
      app: 'friends',
      mark: 'friends-action',
      json: {
        'remove-friend': {
          ship: patp,
        },
      },
    });
    return response;
  },
  /**
   * watchFriends: subscribes and handles responses from the /friends watch path
   *
   * @param conduit the conduit instance
   * @param state the state-tree
   */
  watchFriends: (
    conduit: Urbit,
    friendsStore: FriendsType
  ): Promise<number> => {
    // const RealmAPI = new Conduit(
    //   conduit.url,
    //   conduit.ship!,
    //   conduit.cookie,
    //   'realm'
    // );
    // RealmAPI.init();

    // return 0;
    return conduit.subscribe({
      app: 'friends',
      path: `/all`,
      event: async (data: any) => {
        // console.log(data);
        if (data['friends']) {
          // applySnapshot(state.friends.all, castToSnapshot(data['friends']));
          friendsStore.initial(data['friends']);
        }
        if (data['friend']) {
          const patp = data['friend'].ship;
          const update = data['friend'].friend;
          friendsStore.update(patp, update);
        }
        if (data['new-friend']) {
          const patp = data['new-friend'].ship;
          const friend = data['new-friend'].friend;
          friendsStore.add(patp, friend);
        }
        if (data['bye-friend']) {
          const patp = data['bye-friend'].ship;
          friendsStore.remove(patp);
        }
      },
      err: () => console.log('Subscription rejected'),
      quit: () => console.log('Kicked from subscription'),
    });
  },
};
