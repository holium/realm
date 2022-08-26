import { Conduit } from '@holium/conduit';
import { MembershipType } from './../services/spaces/models/members';
import { SpacesStoreType } from '../services/spaces/models/spaces';
import { snakeify } from '../lib/obj';
import { MemberRole, Patp, SpacePath } from '../types';

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
        onError: (e) => {
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
        onReaction: (data) => {
          resolve(data);
        },
        onError: (e) => {
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
        onReaction: (data) => {
          resolve(data);
        },
        onError: (e) => {
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
      mark: 'invite-action',
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
      mark: 'invite-action',
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
    membersState: MembershipType
  ): void => {
    conduit.watch({
      app: 'spaces',
      path: `/updates`,
      onEvent: async (data: any, _id: number, mark: string) => {
        console.log(mark, data);
        if (mark === 'spaces-reaction') {
          handleSpacesReactions(data, state, membersState);
        }
      },
      onError: () => console.log('Subscription rejected'),
      onQuit: () => console.log('Kicked from subscription'),
    });
  },
};

const handleSpacesReactions = (
  data: any,
  state: SpacesStoreType,
  membersState: MembershipType
) => {
  const reaction: string = Object.keys(data)[0];
  switch (reaction) {
    case 'initial':
      state.initialReaction(data['initial']);
      break;
    case 'add':
      const newSpace = state.addSpace(data['add']);
      membersState.addMemberMap(newSpace, data['add'].members);
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
