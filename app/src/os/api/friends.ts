import { Urbit } from './../urbit/api';
import { SpacesStoreType } from 'os/services/spaces/models/spaces';
import { FriendsType } from 'os/services/spaces/models/friends';
import { Patp } from '../types';

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
      app: 'passports',
      path: '/friends', // the spaces scry is at the root of the path
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
      app: 'passports',
      mark: 'passports-action',
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
      app: 'passports',
      mark: 'passports-action',
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
      app: 'passports',
      mark: 'passports-action',
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
  watchFriends: (conduit: Urbit, state: SpacesStoreType): void => {
    conduit.subscribe({
      app: 'passports',
      path: `/friends`,
      event: async (data: any) => {
        if (data['friends']) {
          state.friends.initial(data['friends']);
        }
        if (data['friend']) {
          const patp = data['friend'].ship;
          const update = data['friend'].friend;
          state.friends.update(patp, update);
        }
        if (data['new-friend']) {
          const patp = data['new-friend'].ship;
          const friend = data['new-friend'].friend;
          state.friends.add(patp, friend);
        }
        if (data['bye-friend']) {
          const patp = data['bye-friend'].ship;
          state.friends.remove(patp);
        }
      },
      err: () => console.log('Subscription rejected'),
      quit: () => console.log('Kicked from subscription'),
    });
  },
};
