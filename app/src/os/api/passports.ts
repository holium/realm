import { applySnapshot, IJsonPatch, applyPatch } from 'mobx-state-tree';
import { ISession } from './../index';
import { quickPoke } from '../lib/poke';
import { Urbit } from './../urbit/api';
import { SpacesStoreType } from '../services/spaces/models/spaces';
import { Patp } from '../types';
// import { cleanNounColor } from '../lib/color';

export const PassportsApi = {
  // getSpaceMembers: async (conduit: Urbit) => {
  //   const response = await conduit.scry({
  //     app: 'spaces',
  //     path: `${path}`, // the spaces scry is at the root of the path
  //   });
  //   return response.friends;
  // },
  addFriend: async (conduit: Urbit, patp: Patp, credentials: ISession) => {
    const response = await quickPoke(
      conduit.ship!,
      {
        app: 'passports',
        mark: 'passports-action',
        json: {
          'add-friend': {
            ship: patp,
          },
        },
      },
      credentials,
      {
        mark: 'passports-reaction',
        path: `/friends`,
        op: 'friend',
      }
    );
    return response;
  },
  editFriend: async (
    conduit: Urbit,
    patp: Patp,
    payload: { pinned: boolean; tags: string[] },
    credentials: ISession
  ) => {
    console.log(payload);
    const response = await conduit.poke({
      app: 'passports',
      mark: 'passports-action',
      json: {
        'edit-friend': {
          ship: patp,
          pinned: payload.pinned,
          tags: payload.tags || [],
        },
      },
    });
    // const response = await quickPoke(
    //   conduit.ship!,
    //   {
    //     app: 'passports',
    //     mark: 'passports-action',
    //     json: {
    //       'edit-friend': {
    //         ship: patp,
    //         pinned: payload.pinned,
    //         tags: payload.tags || [],
    //       },
    //     },
    //   },
    //   credentials
    // );
    return response;
  },
  kickFriend: async (conduit: Urbit, patp: Patp, credentials: ISession) => {
    const response = await quickPoke(
      conduit.ship!,
      {
        app: 'passports',
        mark: 'passports-action',
        json: {
          'kick-friend': {
            ship: patp,
          },
        },
      },
      credentials,
      {
        mark: 'passports-reaction',
        path: `/friends`,
        op: 'bye-friend',
      }
    );
    return response;
  },
  syncUpdates: (conduit: Urbit, state: SpacesStoreType): void => {
    conduit.subscribe({
      app: 'passports',
      path: `/friends`,
      event: async (data: any) => {
        if (data['friends']) {
          applySnapshot(state.friends, { all: data['friends'] });
        }
        if (data['friend']) {
          const patp = data['friend'].ship;
          const update = data['friend'].friend;
          const patches: IJsonPatch[] = Object.keys(update).map(
            (key: string) => ({
              op: 'replace',
              path: `/${patp}/${key}`,
              value: update[key],
            })
          );
          applyPatch(state.friends.all, patches);
        }
      },
      err: () => console.log('Subscription rejected'),
      quit: () => console.log('Kicked from subscription'),
    });
  },
};
