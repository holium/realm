import { Conduit } from '@holium/conduit';
import { Patp } from '@urbit/api';
import { toJS } from 'mobx';

import {
  RoomsAppStateType,
  RoomsModelType,
} from '../services/tray/rooms.model';

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

  requestAllRooms: async (conduit: Conduit) => {
    await conduit.poke({
      app: 'room',
      mark: 'rooms-action',
      json: { 'request-all': null },
    });
  },

  setProvider: async (conduit: Conduit, patp: string) => {
    await conduit.poke({
      app: 'room',
      mark: 'rooms-action',
      json: { 'set-provider': patp },
    });
  },

  joinRoom: async (conduit: Conduit, roomId: string) => {
    await conduit.poke({
      app: 'room',
      mark: 'rooms-action',
      json: { enter: roomId },
    });
  },

  sendChat: async (conduit: Conduit, chat: string) => {
    await conduit.poke({
      app: 'room',
      mark: 'rooms-action',
      json: { chat },
    });
  },

  createRoom: async (
    conduit: Conduit,
    roomId: string,
    access: string,
    title: string
  ) => {
    // TODO add to roomapp state after poke???

    await conduit.poke({
      app: 'room',
      mark: 'rooms-action',
      json: {
        create: {
          rid: roomId,
          access,
          title,
        },
      },
      onSuccess: () => {
        console.log('rooms-create-success');
      },
      onError: (err) => {
        console.error('rooms-create', err);
      },
    });
    // console.log('create');
    // console.log(response);
  },

  leaveRoom: async (
    conduit: Conduit,
    roomId: string,
    state: RoomsAppStateType
  ) => {
    await conduit.poke({
      app: 'room',
      mark: 'rooms-action',
      json: { exit: null },
      onSuccess: () => {
        console.log('rooms-leave-success');
        state.unsetLiveRoom();
        state.removeSelf(roomId, `~${conduit.ship}`);
      },
      onError: (err) => {
        console.error('rooms-leave', err);
      },
    });
  },
  deleteRoom: async (conduit: Conduit, roomId: string) => {
    await conduit.poke({
      app: 'room',
      mark: 'rooms-action',
      json: { delete: roomId },
    });
  },
  invite: async (conduit: Conduit, roomId: string, patp: Patp) => {
    await conduit.poke({
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

  kick: async (conduit: Conduit, roomId: string, patp: Patp) => {
    await conduit.poke({
      app: 'room',
      mark: 'rooms-action',
      json: {
        kick: {
          rid: roomId,
          ship: patp,
        },
      },
    });
  },

  exit: async (conduit: Conduit) => {
    conduit.poke({
      app: 'room',
      mark: 'rooms-action',
      json: {
        exit: null,
      },
    });
  },

  /**
   * watchUpdates: subscribes and handles responses
   *
   * @param conduit the conduit instance
   * @param state the state-tree
   * @param onDiff a callback for passing diffs to the room lib
   */
  watchUpdates: (
    conduit: Conduit,
    state: RoomsAppStateType,
    onDiff: (diff: any, room: RoomsModelType) => void
  ): void => {
    conduit.watch({
      app: 'room',
      path: `/room/local`,
      onEvent: async (data: any) => {
        const update = data['rooms-update'];
        console.log('rooms update', update);
        if (!update) return;
        if (update.room) {
          const { diff, room } = update.room;
          // Send diff as event to renderer
          if (diff) onDiff(diff, room);
          state.handleRoomUpdate(room, diff);
        } else if (update.rooms) {
          state.gotResponse();
          state.setKnownRooms(update.rooms);
        } else if (update.invited) {
          state.handleInvite(update.invited);
        } else if (update.kicked) {
          console.log('kicked', update.kicked);
          //   state.leaveRoom()
          const roomId = update.kicked.id;
          const room = toJS(state.knownRooms.get(roomId));
          const diff = { exit: `~${conduit.ship}` };
          if (room) {
            onDiff(diff, room);
          }

          state.kickRoom(`~${conduit.ship}`, roomId);
          //   state.requestAllRooms();

          // TODO
        } else if (update.chat) {
          // console.log('chat');
          state.handleInboundChat(update.chat.from, update.chat.content);
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
