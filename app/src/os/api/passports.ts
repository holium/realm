import { applySnapshot } from 'mobx-state-tree';
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
    // console.log(response.members);
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
        if (data['members']) {
          state.initial(data['members']);
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

const handleInviteReactions = (
  data: any,
  state: MembershipType,
  id?: string
) => {
  // console.log(data);
  const reaction: string = Object.keys(data)[0];
  // console.log(reaction);
  switch (reaction) {
    case 'invite-sent':
      const sentPayload = data['invite-sent'];
      state.addMember(sentPayload.path, sentPayload.ship, sentPayload.member);
      break;
    case 'invite-accepted':
      const acceptedPayload = data['invite-accepted'];
      state.updateMember(
        acceptedPayload.path,
        acceptedPayload.ship,
        acceptedPayload.member
      );
      break;
    case 'kicked':
      const kickedPayload = data['kicked'];
      state.removeMember(kickedPayload.path, kickedPayload.ship);
      break;
    default:
      // unknown
      break;
  }
};
