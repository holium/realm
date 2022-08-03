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
      { path: '/response', op: 'add' }
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
      { path: '/response', op: 'replace' }
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
      { path: '/response', op: 'remove' }
    );
    return response;
  },
  sendInvite: async (
    conduit: Urbit,
    payload: { path: SpacePath; ship: Patp; role: MemberRole; message: string },
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
          'send-invite': {
            path: pathObj,
            ship: payload.ship,
            role: payload.role,
            message: payload.message,
          },
        },
      },
      credentials,
      { path: '/response', op: 'invite-sent' }
    );
    return response;
  },
  syncUpdates: (conduit: Urbit, state: SpacesStoreType): void => {
    conduit.subscribe({
      app: 'spaces',
      path: `/updates`,
      event: async (data: any) => {
        switch (data) {
          case 'spaces-reaction':
            handleSpacesReactions(data, state);
            break;
          case 'invite-reaction':
            handleInviteReactions(data, state);
            break;
          default:
            // unknown
            break;
        }
      },
      err: () => console.log('Subscription rejected'),
      quit: () => console.log('Kicked from subscription'),
    });
  },
};

const handleSpacesReactions = (data: any, state: SpacesStoreType) => {
  switch (data['spaces-reaction']) {
    case 'initial':
      console.log(data['spaces-reaction']['initial']);
      break;
    case 'add':
      console.log(data['spaces-reaction']['add']);
      break;
    case 'replace':
      console.log(data['spaces-reaction']['replace']);
      break;
    case 'remove':
      console.log(data['spaces-reaction']['remove']);
      break;
    default:
      // unknown
      break;
  }
};

const handleInviteReactions = (data: any, state: SpacesStoreType) => {
  switch (data['invite-reaction']) {
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
