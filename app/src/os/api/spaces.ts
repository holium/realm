import { ISession } from './../index';
import { quickPoke } from '../lib/poke';
import { Urbit } from './../urbit/api';
import { SpacesStoreType } from '../services/spaces/models/spaces';
import { snakeify } from '../lib/obj';
import { MemberRole, Patp, SpacePath } from '../types';
// import { cleanNounColor } from '../lib/color';

export const SpacesApi = {
  getSpaces: async (conduit: Urbit) => {
    const response = await conduit.scry({
      app: 'spaces',
      path: '', // the spaces scry is at the root of the path
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
    payload: { slug: string; payload: any; members: any },
    credentials: ISession
  ) => {
    const response = await quickPoke(
      conduit.ship!,
      {
        app: 'spaces',
        mark: 'spaces-action',
        json: {
          add: payload,
        },
      },
      credentials,
      { mark: 'spaces-reaction', path: '/response', op: 'add' }
    );

    return response;
  },
  updateSpace: async (
    conduit: Urbit,
    payload: { path: SpacePath; payload: any },
    credentials: ISession
  ) => {
    const pathArr = payload.path.split('/');
    const pathObj = {
      ship: pathArr[1],
      space: pathArr[2],
    };
    const response = await quickPoke(
      conduit.ship!,
      {
        app: 'spaces',
        mark: 'spaces-action',
        json: {
          update: {
            path: pathObj,
            payload: snakeify(payload.payload),
          },
        },
      },
      credentials,
      { mark: 'spaces-reaction', path: '/response', op: 'replace' }
    );
    return response;
  },
  deleteSpace: async (
    conduit: Urbit,
    payload: { path: SpacePath },
    credentials: ISession
  ) => {
    const pathArr = payload.path.split('/');
    const pathObj = {
      ship: pathArr[1],
      space: pathArr[2],
    };
    const response = await quickPoke(
      conduit.ship!,
      {
        app: 'spaces',
        mark: 'spaces-action',
        json: {
          remove: {
            path: pathObj,
          },
        },
      },
      credentials,
      { mark: 'spaces-reaction', path: '/response', op: 'remove' }
    );
    return response;
  },
  sendInvite: async (
    conduit: Urbit,
    path: SpacePath,
    payload: { patp: Patp; role: MemberRole; message: string },
    credentials: ISession
  ) => {
    const pathArr = path.split('/');
    const pathObj = {
      ship: pathArr[1],
      space: pathArr[2],
    };
    const response = await quickPoke(
      conduit.ship!,
      {
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
      },
      credentials,
      {
        mark: 'invite-reaction',
        path: `spaces/${pathArr[1]}/${pathArr[2]}`,
        op: 'invite-sent',
      }
    );
    return response;
  },
  kickMember: async (
    conduit: Urbit,
    path: SpacePath,
    patp: Patp,
    credentials: ISession
  ) => {
    const pathArr = path.split('/');
    const pathObj = {
      ship: pathArr[1],
      space: pathArr[2],
    };
    const response = await quickPoke(
      conduit.ship!,
      {
        app: 'spaces',
        mark: 'invite-action',
        json: {
          'kick-member': {
            path: pathObj,
            ship: patp,
          },
        },
      },
      credentials,
      {
        mark: 'invite-reaction',
        path: `spaces/${pathArr[1]}/${pathArr[2]}`,
        op: 'kicked',
      }
    );
    return response;
  },
  watchUpdates: (conduit: Urbit, state: SpacesStoreType): void => {
    conduit.subscribe({
      app: 'spaces',
      path: `/updates`,
      event: async (data: any) => {
        console.log(data);
        if (data['spaces-reaction']) {
          handleSpacesReactions(data['spaces-reaction'], state);
        }
        if (data['invite-reaction']) {
          handleInviteReactions(data['invite-reaction'], state);
        }
      },
      err: () => console.log('Subscription rejected'),
      quit: () => console.log('Kicked from subscription'),
    });
  },
};

const handleSpacesReactions = (data: any, state: SpacesStoreType) => {
  const reaction: string = Object.keys(data)[0];
  switch (reaction) {
    case 'initial':
      // console.log(data['initial']);
      state.initialReaction(data['initial']);
      break;
    case 'add':
      console.log(data['add']);
      break;
    case 'replace':
      console.log(data['replace']);
      break;
    case 'remove':
      console.log(data['remove']);
      break;
    default:
      // unknown
      break;
  }
};

const handleInviteReactions = (data: any, state: SpacesStoreType) => {
  const reaction: string = Object.keys(data)[0];
  switch (reaction) {
    case 'invite-sent':
      console.log(data['invite-reaction']['invite-sent']);
      break;
    case 'invite-accepted':
      console.log(data['invite-reaction']['invite-accepted']);
      break;
    case 'kicked':
      console.log(data['invite-reaction']['kicked']);
      break;
    default:
      // unknown
      break;
  }
};
