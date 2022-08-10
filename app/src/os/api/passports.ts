import {
  applySnapshot,
  IJsonPatch,
  applyPatch,
  getSnapshot,
} from 'mobx-state-tree';
import { Urbit } from './../urbit/api';
import { SpacesStoreType } from '../services/spaces/models/spaces';
import { MemberRole, Patp, SpacePath } from '../types';
import { MembershipType, MembersType } from '../services/spaces/models/members';
// import { cleanNounColor } from '../lib/color';

export const PassportsApi = {
  getMembers: async (conduit: Urbit, path: SpacePath) => {
    const response = await conduit.scry({
      app: 'passports',
      path: `${path}/members`, // the spaces scry is at the root of the path
    });
    return response.members;
  },
  /**
   * inviteMember: invite a member to a space
   *
   * @param conduit the conduit instance
   * @param path  i.e. ~lomder-librun/my-place
   * @param payload  {patp: string, role: string, message: string}

   * @returns
   */
  inviteMember: async (
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
      app: 'passports',
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
      app: 'passports',
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
  watchMembers: (conduit: Urbit, state: MembershipType): void => {
    conduit.subscribe({
      app: 'passports',
      path: `/all`,
      event: async (data: any) => {
        console.log(data);
        if (data['all']) {
          applySnapshot(state.spaces, data['all']);
          // applySnapshot(state.initial(data[members]))
          // Object.keys(data['members']).forEach((spaceKey: string) => {
          //   const space = state.spaces.get(spaceKey)!;
          //   if (space) {
          //     console.log(spaceKey, space);
          //     const members = data['members'][spaceKey];
          //     applySnapshot(space.members, {
          //       all: members,
          //     });
          //   }
          // });
        }
        // if (data['friend']) {
        //   const patp = data['friend'].ship;
        //   const update = data['friend'].friend;
        //   const patches: IJsonPatch[] = Object.keys(update).map(
        //     (key: string) => ({
        //       op: 'replace',
        //       path: `/${patp}/${key}`,
        //       value: update[key],
        //     })
        //   );
        //   applyPatch(state.friends.all, patches);
        // }
      },
      err: () => console.log('Subscription rejected'),
      quit: () => console.log('Kicked from subscription'),
    });
  },
};
