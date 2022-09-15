import { Conduit } from '@holium/conduit';
import { MembershipType } from './../services/spaces/models/members';
import { SpacesStoreType } from '../services/spaces/models/spaces';
import { snakeify } from '../lib/obj';
import { MemberRole, Patp, SpacePath } from '../types';
import { BazaarStoreType } from 'os/services/spaces/models/bazaar';

export const SpacesApi = {
  getSpaces: async (conduit: Conduit) => {
    const response = await conduit.scry({
      app: 'spaces',
      path: '/all', // the spaces scry is at the root of the path
    });
    return response.spaces;
  },
  createSpace: async (
    conduit: Conduit,
    payload: { slug: string; payload: any; members: any }
  ): Promise<SpacePath> => {
    return new Promise((resolve, reject) => {
      conduit.poke({
        app: 'spaces',
        mark: 'spaces-action',
        json: {
          add: payload,
        },
        reaction: 'spaces-reaction.add',
        onReaction: (data: any) => {
          resolve(data.add.space.path);
        },
        onError: (e: any) => {
          reject(e);
        },
      });
    });
  },
  updateSpace: async (
    conduit: Conduit,
    payload: { path: SpacePath; payload: any }
  ) => {
    const pathArr = payload.path.split('/');
    const pathObj = {
      ship: pathArr[1],
      space: pathArr[2],
    };
    return new Promise((resolve, reject) => {
      conduit.poke({
        app: 'spaces',
        mark: 'spaces-action',
        json: {
          update: {
            path: pathObj,
            payload: snakeify(payload.payload),
          },
        },
        reaction: 'spaces-reaction.replace',
        onReaction: (data: any) => {
          resolve(data);
        },
        onError: (e: any) => {
          reject(e);
        },
      });
    });
  },
  deleteSpace: async (conduit: Conduit, payload: { path: SpacePath }) => {
    const pathArr = payload.path.split('/');
    const pathObj = {
      ship: pathArr[1],
      space: pathArr[2],
    };
    return new Promise((resolve, reject) => {
      conduit.poke({
        app: 'spaces',
        mark: 'spaces-action',
        json: {
          remove: {
            path: pathObj,
          },
        },
        reaction: 'spaces-reaction.delete',
        onReaction: (data: any) => {
          resolve(data);
        },
        onError: (e: any) => {
          reject(e);
        },
      });
    });
  },
  sendInvite: async (
    conduit: Conduit,
    path: SpacePath,
    payload: { patp: Patp; role: MemberRole; message: string }
  ) => {
    const pathArr = path.split('/');
    const pathObj = {
      ship: pathArr[1],
      space: pathArr[2],
    };
    const response = await conduit.poke({
      app: 'spaces',
      mark: 'visa-action',
      json: {
        'send-invite': {
          path: pathObj,
          ship: payload.patp,
          role: payload.role,
          message: payload.message,
        },
      },
    });
    return response;
  },
  kickMember: async (conduit: Conduit, path: SpacePath, patp: Patp) => {
    const pathArr = path.split('/');
    const pathObj = {
      ship: pathArr[1],
      space: pathArr[2],
    };
    const response = await conduit.poke({
      app: 'spaces',
      mark: 'visa-action',
      json: {
        'kick-member': {
          path: pathObj,
          ship: patp,
        },
      },
    });
    return response;
  },
  watchUpdates: (
    conduit: Conduit,
    state: SpacesStoreType,
    membersState: MembershipType,
    bazaarState: BazaarStoreType
  ): void => {
    conduit.watch({
      app: 'spaces',
      path: `/updates`,
      onEvent: async (data: any, _id?: number, mark?: string) => {
        // console.log(mark, data);
        if (mark === 'spaces-reaction') {
          handleSpacesReactions(data, state, membersState, bazaarState);
        }
      },

      onError: () => console.log('Subscription rejected'),
      onQuit: () => console.log('Kicked from subscription %spaces'),
    });
  },
};

const handleSpacesReactions = (
  data: any,
  state: SpacesStoreType,
  membersState: MembershipType,
  bazaarState: BazaarStoreType
) => {
  const reaction: string = Object.keys(data)[0];
  switch (reaction) {
    case 'initial':
      state.initialReaction(data['initial']);
      break;
    case 'add':
      const newSpace = state.addSpace(data['add']);
      membersState.addMemberMap(newSpace, data['add'].members);
      bazaarState.addBazaar(newSpace);
      break;
    case 'replace':
      state.updateSpace(data['replace']);
      break;
    case 'remove':
      const deleted = state.deleteSpace(data['remove']);
      membersState.removeMemberMap(deleted);
      break;
    default:
      // unknown
      break;
  }
};
