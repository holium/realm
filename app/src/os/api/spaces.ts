import { Conduit } from '@holium/conduit';
import { MembershipType } from './../services/spaces/models/members';
import { SpacesStoreType } from '../services/spaces/models/spaces';
import { snakeify } from '../lib/obj';
import { MemberRole, Patp, SpacePath } from '../types';
import { VisaModelType } from 'os/services/spaces/models/visas';
import { NewBazaarStoreType } from 'os/services/spaces/models/bazaar';
import { getHost } from '../services/spaces/spaces.service';

export const SpacesApi = {
  getSpaces: async (conduit: Conduit) => {
    const response = await conduit.scry({
      app: 'spaces',
      path: '/all', // the spaces scry is at the root of the path
    });
    return response.spaces;
  },
  getMembers: async (conduit: Conduit, path: SpacePath) => {
    const response = await conduit.scry({
      app: 'spaces',
      path: `${path}/members`, // the spaces scry is at the root of the path
    });
    return response.members;
  },
  getInvitations: async (conduit: Conduit) => {
    const response = await conduit.scry({
      app: 'spaces',
      path: '/invitations', // the spaces scry is at the root of the path
    });
    return response.invites;
  },
  createSpace: async (
    conduit: Conduit,
    payload: { slug: string; payload: any; members: any }
  ): Promise<SpacePath> => {
    return await new Promise((resolve, reject) => {
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
  ): Promise<SpacePath> => {
    const pathArr = payload.path.split('/');
    const pathObj = {
      ship: pathArr[1],
      space: pathArr[2],
    };
    return await new Promise((resolve, reject) => {
      console.log({
        update: {
          path: pathObj,
          payload: snakeify(payload.payload),
        },
      });
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
    return await new Promise((resolve, reject) => {
      conduit.poke({
        app: 'spaces',
        mark: 'spaces-action',
        json: {
          remove: {
            path: pathObj,
          },
        },
        reaction: 'spaces-reaction.remove',
        onReaction: (data: any) => {
          resolve(data);
        },
        onError: (e: any) => {
          reject(e);
        },
      });
    });
  },
  joinSpace: async (conduit: Conduit, payload: { path: SpacePath }) => {
    const pathArr = payload.path.split('/');
    const pathObj = {
      ship: pathArr[0],
      space: pathArr[1],
    };
    return new Promise((resolve, reject) => {
      conduit.poke({
        app: 'spaces',
        mark: 'spaces-action',
        json: {
          join: {
            path: pathObj,
          },
        },
        reaction: 'spaces-reaction.remote-space',
        onReaction: (data: any) => {
          resolve(data);
        },
        onError: (e: any) => {
          reject(e);
        },
      });
    });
  },
  leaveSpace: async (conduit: Conduit, payload: { path: SpacePath }) => {
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
          leave: {
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
  setCurrentSpace: async (conduit: Conduit, payload: { path: SpacePath }) => {
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
          current: {
            path: pathObj,
          },
        },
        reaction: 'spaces-reaction.current',
        onReaction: (data: any) => {
          resolve(data);
        },
        onError: (e: any) => {
          reject(e);
        },
      });
    });
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
  /**
   * kickMember: kicks a member from a space
   *
   * @param conduit
   * @param path
   * @param patp
   * @returns
   */
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
  /**
   * setRoles
   *
   * @param conduit
   * @param path
   * @param patp
   * @param roles
   * @returns
   */
  setRoles: async (
    conduit: Conduit,
    path: SpacePath,
    patp: Patp,
    roles: string[]
  ) => {
    const pathArr = path.split('/');
    const pathObj = {
      ship: pathArr[1],
      space: pathArr[2],
    };
    const payload = {
      app: 'spaces',
      mark: 'visa-action',
      json: {
        'edit-member-role': {
          path: pathObj,
          ship: patp,
          roles,
        },
      },
    };
    return conduit.poke(payload);
  },
  /**
   * acceptInvite
   *
   * @param conduit
   * @param path
   * @returns
   */
  acceptInvite: async (
    conduit: Conduit,
    path: SpacePath,
    membersState: MembershipType,
    spacesState: SpacesStoreType
  ) => {
    const pathArr = path.split('/');
    const pathObj = {
      ship: pathArr[1],
      space: pathArr[2],
    };
    return await new Promise((resolve, reject) => {
      conduit.poke({
        app: 'spaces',
        mark: 'visa-action',
        json: {
          'accept-invite': {
            path: pathObj,
          },
        },
        reaction: 'spaces-reaction.remote-space',
        onReaction(data) {
          membersState.addMemberMap(
            data['remote-space'].path,
            data['remote-space'].members
          );
          spacesState.addSpace(data['remote-space']);
          resolve(data);
        },
        onError() {
          reject();
        },
      });
    });
    // return response;
  },
  /**
   * declineInvite
   *
   * @param conduit
   * @param path
   * @returns
   */
  declineInvite: async (conduit: Conduit, path: SpacePath) => {
    const pathArr = path.split('/');
    const pathObj = {
      ship: pathArr[1],
      space: pathArr[2],
    };

    const response = await conduit.poke({
      app: 'spaces',
      mark: 'visa-action',
      json: {
        'decline-invite': {
          path: pathObj,
        },
      },
    });
    return response;
  },
  /**
   * watchUpdates
   *
   * @param conduit
   * @param state
   * @param membersState
   * @param bazaarState
   */
  watchUpdates: (
    conduit: Conduit,
    spacesState: SpacesStoreType,
    membersState: MembershipType,
    bazaarState: NewBazaarStoreType,
    visaState: VisaModelType,
    roomService: any,
    setTheme: (theme: any) => void
  ): void => {
    conduit.watch({
      app: 'spaces',
      path: `/updates`,
      onEvent: async (data: any, _id?: number, mark?: string) => {
        // console.log(mark, data);
        if (mark === 'spaces-reaction') {
          handleSpacesReactions(
            data,
            `~${conduit.ship}`,
            spacesState,
            membersState,
            bazaarState,
            visaState,
            roomService,
            setTheme
          );
        }
        if (mark === 'visa-reaction') {
          handleInviteReactions(
            data['visa-reaction'],
            conduit.ship ?? '',
            membersState,
            spacesState,
            visaState,
            setTheme
          );
        }
      },
      onSubscribed: () => {
        spacesState.setSubscriptionStatus('subscribed');
      },
      onError: () => {
        console.error('Subscription to %spaces rejected');
        spacesState.setSubscriptionStatus('unsubscribed');
      },
      onQuit: () => {
        console.error('Kicked from %spaces subscription');
        spacesState.setSubscriptionStatus('unsubscribed');
      },
    });
  },
};

const handleSpacesReactions = (
  data: any,
  our: Patp,
  spacesState: SpacesStoreType,
  membersState: MembershipType,
  _bazaarState: NewBazaarStoreType,
  visaState: VisaModelType,
  roomService: any,
  setTheme: (theme: any) => void
) => {
  const reaction: string = Object.keys(data)[0];
  switch (reaction) {
    case 'initial':
      spacesState.initialReaction(data.initial, our);
      membersState.initial(data.initial.membership);
      if (data.initial.invitations) {
        visaState.initialIncoming(data.initial.invitations);
      }
      // handle current
      if (
        data.initial.current &&
        spacesState.selected?.path !== data.initial.current.path
      ) {
        const currentPath = data.initial.current.path;
        spacesState.selectSpace(currentPath);
        setTheme(spacesState.getSpaceByPath(currentPath)?.theme);
        roomService.setProvider(getHost(currentPath));
      }
      // roomService.setProvider(null, getHost(spacesState.selected.path));
      break;
    case 'add':
      const newSpace = spacesState.addSpace(data.add);
      membersState.addMemberMap(newSpace, data.add.members);
      break;
    case 'replace':
      spacesState.updateSpace(data.replace);
      break;
    case 'remove':
      const deleted = spacesState.deleteSpace(
        `/${our}/our`,
        data.remove,
        setTheme
      );
      membersState.removeMemberMap(deleted);
      break;
    case 'remote-space':
      if (Object.keys(data['remote-space'].members).length === 0) {
        spacesState.setJoin('error');
      } else {
        membersState.addMemberMap(
          data['remote-space'].path,
          data['remote-space'].members
        );
        spacesState.addSpace(data['remote-space']);
      }
      break;
    default:
      // unknown
      break;
  }
};

const handleInviteReactions = (
  data: any,
  ship: string,
  state: MembershipType,
  spacesState: SpacesStoreType,
  visaState: VisaModelType,
  setTheme: (theme: any) => void
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
      const kickedPayload = data.kicked;
      if (`~${ship}` === kickedPayload.ship) {
        spacesState.deleteSpace(
          `/~${ship}/our`,
          {
            'space-path': kickedPayload.path,
          },
          setTheme
        );
      }
      state.removeMember(kickedPayload.path, kickedPayload.ship);
      break;
    case 'edited':
      const editedPayload = data.edited;
      state.editMember(
        editedPayload.path,
        editedPayload.ship,
        editedPayload.roles
      );
      break;
    default:
      // unknown
      break;
  }
};
