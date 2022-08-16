import { ShipModelType } from './../services/ship/models/ship';
import { Urbit } from './../urbit/api';
import { applySnapshot, castToReferenceSnapshot, cast } from 'mobx-state-tree';
import {
  RoomsAppStateType,
  RoomsModel,
  RoomsModelType,
} from '../services/tray/rooms.model';
import { saturate } from 'polished';
import { m } from 'framer-motion';
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

  getPresent: async (conduit: Urbit) => {
    const response = await conduit.scry({
      app: 'room',
      path: '/present',
    });
    console.log('get present response: ');
    console.log(response);
    console.log();
    return response;
  },

  getFull: async (conduit: Urbit) => {
    const response = await conduit.scry({
      app: 'room',
      path: '',
    });
    console.log('get full response: ');
    console.log(response);
    console.log();
    return response;
  },

  getProvider: async (conduit: Urbit) => {
    const response = await conduit.scry({
      app: 'room',
      path: '/provider',
    });
    return response;
  },

  requestAllRooms: (conduit: Urbit) => {
    conduit.poke({
      app: 'room',
      mark: 'rooms-action',
      json: { 'request-all': null },
    });
  },

  setProvider: async (conduit: Urbit, patp: string) => {
    const response = await conduit.poke({
      app: 'room',
      mark: 'rooms-action',
      json: { 'set-provider': patp },
    });
    return;
  },

  joinRoom: async (conduit: Urbit, roomId: string) => {
    const response = await conduit.poke({
      app: 'room',
      mark: 'rooms-action',
      json: { enter: roomId },
    });
    return;
  },

  createRoom: async (
    conduit: Urbit,
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
    conduit: Urbit,
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
    conduit: Urbit,
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
  invite: async (conduit: Urbit, roomId: string, patp: Patp) => {
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
    conduit: Urbit,
    state: RoomsAppStateType,
    onKick: () => void // TODO
  ): void => {
    conduit.subscribe({
      app: 'room',
      path: `/room/local`,
      event: async (data: any) => {
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

      err: () => console.log('app/room/hoon Subscription rejected'),
      quit: () => {
        // TODO attempt to resubscribe
        // watchUpdates(conduit, state)
        console.log('Kicked from app/room/hoon subscription');
      },
    });
  },
};
