import { Conduit } from '@holium/conduit';
import { RoomsAppStateType } from '../services/tray/rooms.model';
import { Patp } from '@urbit/api';

export const RoomsApi = {
  /**
   * getFriends: returns a map of friends
   *
   * @param conduit the conduit instance
   * @returns Promise<{ [patp: Patp]: FriendsType }>
   */

  // TODO exit routine
  //    logout: async (
  //     conduit: Urbit
  //   ) => {
  //     const response = await conduit.poke({
  //       app: 'room',
  //       mark: 'rooms-action',
  //       json: {'logout': null}
  //     });
  //     console.log("roomsApi logout successful :) ");
  //     // console.log(response);
  //     // console.log();
  //     // return response;
  //   },

  getPresent: async (conduit: Conduit) => {
    const response = await conduit.scry({
      app: 'room',
      path: '/present',
    });
    console.log('get present response: ');
    console.log(response);
    console.log();
    return response;
  },

  getFull: async (conduit: Conduit) => {
    const response = await conduit.scry({
      app: 'room',
      path: '',
    });
    console.log('get full response: ');
    console.log(response);
    console.log();
    return response;
  },

  getProvider: async (conduit: Conduit) => {
    const response = await conduit.scry({
      app: 'room',
      path: '/provider',
    });
    return response;
  },

  requestAllRooms: (conduit: Conduit) => {
    conduit.poke({
      app: 'room',
      mark: 'rooms-action',
      json: { 'request-all': null },
    });
  },

  setProvider: async (conduit: Conduit, patp: string) => {
    const response = await conduit.poke({
      app: 'room',
      mark: 'rooms-action',
      json: { 'set-provider': patp },
    });
    return;
  },

  joinRoom: async (conduit: Conduit, roomId: string) => {
    const response = await conduit.poke({
      app: 'room',
      mark: 'rooms-action',
      json: { enter: roomId },
    });
    return;
  },

  createRoom: async (
    conduit: Conduit,
    roomId: string,
    access: string,
    title: string,
    enter: boolean
  ) => {
    // TODO add to roomapp state after poke???
    const response = await conduit.poke({
      app: 'room',
      mark: 'rooms-action',
      json: {
        create: {
          rid: roomId,
          access: access,
          title: title,
          enter: enter,
        },
      },
    });
    // console.log('create');
    console.log(response);
    return;
  },

  leaveRoom: async (
    conduit: Conduit,
    roomId: string,
    state: RoomsAppStateType
  ) => {
    const response = await conduit.poke({
      app: 'room',
      mark: 'rooms-action',
      json: { exit: null },
      onSuccess: () => {
        state.removeSelf(roomId, `~${conduit.ship!}`);
      },
    });
    return;
  },
  deleteRoom: async (
    conduit: Conduit,
    roomId: string,
    state: RoomsAppStateType
  ) => {
    const response = await conduit.poke({
      app: 'room',
      mark: 'rooms-action',
      json: { delete: roomId },
    });
    return;
  },
  invite: async (conduit: Conduit, roomId: string, patp: Patp) => {
    conduit.poke({
      app: 'room',
      mark: 'rooms-action',
      json: {
        invite: {
          rid: roomId,
          ship: patp,
        },
      },
    });
  },

  /**
   * watchUpdates: subscribes and handles responses
   *
   * @param conduit the conduit instance
   * @param state the state-tree
   */
  watchUpdates: (
    conduit: Conduit,
    state: RoomsAppStateType,
    onKick: () => void // TODO
  ): void => {
    conduit.watch({
      app: 'room',
      path: `/room/local`,
      onEvent: async (data: any) => {
        let update = data['rooms-update'];
        if (!update) return;
        if (update['room']) {
          //
          // console.log('room update', update['room']);

          state.handleRoomUpdate(update['room']);
        } else if (update['rooms']) {
          // console.log('rooms');
          state.setKnownRooms(update['rooms']);
        } else if (update['invited']) {
          state.handleInvite(update['invited']);
        } else if (update['kicked']) {
          // console.log('kicked', update['kicked']);
          //   state.leaveRoom()
          const roomId = update['kicked'].id;
          state.kickRoom(`~${conduit.ship!}`, roomId);
          //   state.requestAllRooms();

          // TODO
        } else if (update['chat']) {
          // console.log('chat');
        }
      },

      onError: () => console.log('app/room/hoon Subscription rejected'),
      onQuit: () => {
        // TODO attempt to resubscribe
        // watchUpdates(conduit, state)
        console.log('Kicked from app/room/hoon subscription');
      },
    });
  },
};
