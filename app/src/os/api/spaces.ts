import { ISession } from './../index';
import { quickPoke } from '../lib/poke';
import { Urbit } from './../urbit/api';
import { SpacesStoreType } from '../services/spaces/models/spaces';
import { snakeify } from '../lib/obj';
import { MemberRole, Patp, SpacePath } from '../types';
// import { cleanNounColor } from '../lib/color';

const pendingRequests: { [key: string]: (data?: any) => any } = {};

export const SpacesApi = {
  getSpaces: async (conduit: Urbit) => {
    const response = await conduit.scry({
      app: 'spaces',
      path: '/all', // the spaces scry is at the root of the path
    });
    return response.spaces;
  },
  getInvitations: async (conduit: Urbit) => {
    const response = await conduit.scry({
      app: 'spaces',
      path: `/invitations`, // the spaces scry is at the root of the path
    });
    return response.invitations;
  },
  getMembers: async (conduit: Urbit, path: SpacePath) => {
    const response = await conduit.scry({
      app: 'spaces',
      path: `${path}/members`, // the spaces scry is at the root of the path
    });
    return response.members;
  },
  getFriends: async (conduit: Urbit) => {
    const response = await conduit.scry({
      app: 'spaces',
      path: `/friends`, // the spaces scry is at the root of the path
    });
    return response.friends;
  },
  createSpace: async (
    conduit: Urbit,
    payload: { slug: string; payload: any; members: any }
  ): Promise<SpacePath> => {
    console.log(payload);
    await conduit.poke({
      app: 'spaces',
      mark: 'spaces-action',
      json: {
        add: payload,
      },
    });
    return new Promise((resolve) => {
      pendingRequests['spaces-action-add'] = (data: any) => {
        resolve(data);
      };
    });
  },
  updateSpace: async (
    conduit: Urbit,
    payload: { path: SpacePath; payload: any }
  ) => {
    const pathArr = payload.path.split('/');
    const pathObj = {
      ship: pathArr[1],
      space: pathArr[2],
    };
    const response = await conduit.poke({
      app: 'spaces',
      mark: 'spaces-action',
      json: {
        update: {
          path: pathObj,
          payload: snakeify(payload.payload),
        },
      },
    });
    return new Promise((resolve) => {
      pendingRequests['spaces-action-replace'] = () => {
        resolve(response);
      };
    });
  },
  deleteSpace: async (conduit: Urbit, payload: { path: SpacePath }) => {
    const pathArr = payload.path.split('/');
    const pathObj = {
      ship: pathArr[1],
      space: pathArr[2],
    };
    await conduit.poke({
      app: 'spaces',
      mark: 'spaces-action',
      json: {
        remove: {
          path: pathObj,
        },
      },
    });
    return new Promise((resolve) => {
      pendingRequests['spaces-action-remove'] = (data: any) => {
        resolve(data);
      };
    });
  },
  sendInvite: async (
    conduit: Urbit,
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
  kickMember: async (conduit: Urbit, path: SpacePath, patp: Patp) => {
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
  watchUpdates: (conduit: Urbit, state: SpacesStoreType): void => {
    conduit.subscribe({
      app: 'spaces',
      path: `/updates`,
      event: async (data: any, id: string) => {
        console.log(data);
        if (data['spaces-reaction']) {
          handleSpacesReactions(data['spaces-reaction'], state, id);
        }
        if (data['invite-reaction']) {
          handleInviteReactions(data['invite-reaction'], state, id);
        }
      },
      err: () => console.log('Subscription rejected'),
      quit: () => console.log('Kicked from subscription'),
    });
  },
};

const handleSpacesReactions = (
  data: any,
  state: SpacesStoreType,
  id: string
) => {
  const reaction: string = Object.keys(data)[0];
  switch (reaction) {
    case 'initial':
      console.log(data['initial']);
      state.initialReaction(data['initial']);
      break;
    case 'add':
      const newSpace = state.addSpace(data['add']);
      if (pendingRequests['spaces-action-add']) {
        pendingRequests['spaces-action-add'](newSpace);
        pendingRequests['spaces-action-add'] = () => {};
      }
      break;
    case 'replace':
      state.updateSpace(data['replace']);
      if (pendingRequests['spaces-action-replace']) {
        pendingRequests['spaces-action-replace']();
        pendingRequests['spaces-action-replace'] = () => {};
      }
      break;
    case 'remove':
      const deleted = state.deleteSpace(data['remove']);
      if (pendingRequests['spaces-action-remove'])
        pendingRequests['spaces-action-remove'](deleted);
      break;
    default:
      // unknown
      break;
  }
};

const handleInviteReactions = (
  data: any,
  state: SpacesStoreType,
  id: string
) => {
  console.log(data);
  const reaction: string = Object.keys(data)[0];
  console.log(reaction);
  switch (reaction) {
    case 'invite-sent':
      console.log(data['invite-sent']);
      break;
    case 'invite-accepted':
      console.log(data['invite-accepted']);
      break;
    case 'kicked':
      console.log(data['kicked']);
      break;
    default:
      // unknown
      break;
  }
};
