import { Conduit } from '@holium/conduit';
import { cleanNounColor, removeHash } from '../../os/lib/color';
import { FriendsType } from '../services/ship/models/friends';
import { Patp } from '../types';

export const FriendsApi = {
  getContact: async (
    conduit: Conduit,
    ship: string
  ) => {
    const contact = await conduit.scry({
      app: 'friends',
      path: `/contact/${ship}`,
    })
    return {
      ...contact,
      color: contact.color && cleanNounColor(contact.color),
    };
  },
  saveContact: async (conduit: Conduit, ship: string, data: any) => {
    console.log('data', data);
    const preparedData: any = {
      nickname: data.nickname,
      color: removeHash(data.color),
      avatar: data.avatar || '',
      bio: data.bio,
      cover: data.cover || null,
    };
    const payload =  {
      app: 'friends',
      mark: 'friends-action',
      json: {
        'set-contact': {
          ship,
          'contact-info': preparedData,
        },
      },
    };
    return await conduit.poke(payload);
  },
  /**
   * getFriends: returns a map of friends
   *
   * @param conduit the conduit instance
   * @returns Promise<{ [patp: Patp]: FriendsType }>
   */
  getFriends: async (
    conduit: Conduit
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
  addFriend: async (conduit: Conduit, patp: Patp) => {
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
    conduit: Conduit,
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
  removeFriend: async (conduit: Conduit, patp: Patp) => {
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
  watchFriends: async (
    conduit: Conduit,
    friendsStore: FriendsType
  ): Promise<any> => {
    return await conduit.watch({
      app: 'friends',
      path: `/all`,
      onEvent: async (data: any, _id?: number) => {
        if (data.friends) {
          friendsStore.initial(data.friends);
        }
        if (data.friend) {
          const patp = data.friend.ship;
          const update = data.friend.friend;
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
      onSubscribed: () => {
        console.log('Subscribed to %friends');
        friendsStore.setSubscriptionStatus('subscribed');
      },
      onError: () => {
        console.error('Subscription to %friends rejected');
        friendsStore.setSubscriptionStatus('unsubscribed');
      },
      onQuit: () => {
        console.error('Kicked from %friends subscription');
        friendsStore.setSubscriptionStatus('unsubscribed');
      },
    });
  },
};
