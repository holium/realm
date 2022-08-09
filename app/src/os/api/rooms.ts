import { ShipModelType } from './../services/ship/models/ship';
import { Urbit } from './../urbit/api';
import { applySnapshot, castToSnapshot } from 'mobx-state-tree';
import { RoomsAppStateType, RoomsModelType } from '../services/tray/rooms.model';

export const RoomsApi = {
  /**
   * getFriends: returns a map of friends
   *
   * @param conduit the conduit instance
   * @returns Promise<{ [patp: Patp]: FriendsType }>
   */
  getPresent: async (
    conduit: Urbit
  ) => {
    const response = await conduit.scry({
      app: 'room',
      path: '/present', // the spaces scry is at the root of the path
    });
    console.log("is present response: ");
    console.log(response);
    console.log();
    return response;
  },

  addFriend: async (conduit: Urbit, patp: string) => {
    const response = await conduit.poke({
      app: 'rooms',
      mark: 'room-action',
      json: {
        'add-friend': {
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
  watchUpdates: (conduit: Urbit, state: RoomsAppStateType): void => {
    console.log(conduit.ship)
    console.log("watching room lkajsndoiallkasnf819232318923")
    conduit.subscribe({
      app: 'room',
      path: `/room/local`,
      event: async (data: any) => {
        console.log('room bitch', data);
        // if (data['friends']) {
        //   // applySnapshot(state.friends.all, castToSnapshot(data['friends']));
        //   state.friends.initial(data['friends']);
        // }
        // if (data['friend']) {
        //   const patp = data['friend'].ship;
        //   const update = data['friend'].friend;
        //   state.friends.update(patp, update);
        // }
        // if (data['new-friend']) {
        //   const patp = data['new-friend'].ship;
        //   const friend = data['new-friend'].friend;
        //   state.friends.add(patp, friend);
        // }
        // if (data['bye-friend']) {
        //   const patp = data['bye-friend'].ship;
        //   state.friends.remove(patp);
        // }
      },
      err: () => console.log('Subscription rejected'),
      quit: () => console.log('Kicked from subscription'),
    });
  },
};