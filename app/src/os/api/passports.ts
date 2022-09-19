import { Conduit } from '@holium/conduit';
import { MemberRole, Patp, SpacePath } from '../types';
import { MembershipType } from '../services/spaces/models/members';
import { SpacesStoreType } from 'os/services/spaces/models/spaces';
import { VisaModelType } from 'os/services/spaces/models/visas';

export const PassportsApi = {
  getMembers: async (conduit: Conduit, path: SpacePath) => {
    const response = await conduit.scry({
      app: 'passports',
      path: `${path}/members`, // the spaces scry is at the root of the path
    });
    return response.members;
  },
  getVisas: async (conduit: Conduit) => {
    const response = await conduit.scry({
      app: 'passports',
      path: '/visas', // the spaces scry is at the root of the path
    });
    return response.invites;
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
      app: 'passports',
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
      app: 'passports',
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
  acceptInvite: async (conduit: Conduit, path: SpacePath) => {
    const pathArr = path.split('/');
    const pathObj = {
      ship: pathArr[1],
      space: pathArr[2],
    };
    const response = await conduit.poke({
      app: 'passports',
      mark: 'visa-action',
      json: {
        'accept-invite': {
          path: pathObj,
        },
      },
    });
    return response;
  },
  declineInvite: async (conduit: Conduit, path: SpacePath) => {
    const pathArr = path.split('/');
    const pathObj = {
      ship: pathArr[1],
      space: pathArr[2],
    };

    const response = await conduit.poke({
      app: 'passports',
      mark: 'visa-action',
      json: {
        'decline-invite': {
          path: pathObj,
        },
      },
    });
    return response;
  },
  watchMembers: (
    conduit: Conduit,
    state: MembershipType,
    spacesState: SpacesStoreType,
    visaState: VisaModelType
  ): void => {
    conduit.watch({
      app: 'passports',
      path: `/all`,
      onEvent: async (data: any) => {
        if (data['members']) {
          state.initial(data['members']);
        }
        if (data['new-members']) {
          const { path, members } = data['new-members'];
          state.addMemberMap(path, members);
        }

        if (data['visa-reaction']) {
          handleInviteReactions(
            data['visa-reaction'],
            conduit.ship!,
            state,
            spacesState,
            visaState
          );
        }
      },

      onError: () => console.log('Subscription rejected'),
      onQuit: () => console.log('Kicked from subscription'),
    });
  },
};

const handleInviteReactions = (
  data: any,
  ship: string,
  state: MembershipType,
  spacesState: SpacesStoreType,
  visaState: VisaModelType
) => {
  const reaction: string = Object.keys(data)[0];
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
    case 'invite-received':
      const receivedPayload = data['invite-received'];
      visaState.addIncoming(receivedPayload);
      break;
    case 'invite-removed':
      const removePayload = data['invite-removed'];
      visaState.removeIncoming(removePayload.path);

      break;
    case 'kicked':
      const kickedPayload = data['kicked'];
      if (`~${ship}` === kickedPayload.ship) {
        spacesState.deleteSpace({ 'space-path': kickedPayload.path });
      }
      state.removeMember(kickedPayload.path, kickedPayload.ship);
      break;
    default:
      // unknown
      break;
  }
};
