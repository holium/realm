import { ISession } from './../index';
import { quickPoke } from '../lib/poke';
import { Urbit } from './../urbit/api';
import { SpacesStoreType } from '../services/spaces/models/spaces';
import { snakeify } from '../lib/obj';
// import { cleanNounColor } from '../lib/color';

export const SpacesApi = {
  getSpaces: async (conduit: Urbit) => {
    const response = await conduit.scry({
      app: 'spaces',
      path: '', // the spaces scry is at the root of the path
    });
    return response.spaces;
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
    payload: { path: string; payload: any },
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
    payload: { path: string },
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
  syncUpdates: (conduit: Urbit, state: SpacesStoreType): void => {
    conduit.subscribe({
      app: 'spaces',
      path: `/updates`,
      event: async (data: any) => {
        switch (data['spaces-reaction']) {
          case 'initial':
            // console.log(data['spaces-reaction']);
            break;
          case 'add':
            console.log(data['spaces-reaction']['add']);
            break;
          case 'replace':
            console.log(data['spaces-reaction']['replace']);
            break;
          case 'remove':
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
