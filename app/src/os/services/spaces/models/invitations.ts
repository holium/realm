import {
  Instance,
  types,
  applySnapshot,
  castToSnapshot,
  clone,
  applyPatch,
} from 'mobx-state-tree';

export const Invite = types.model({
  inviter: types.string,
  patp: types.string,
  role: types.string,
  message: types.string,
  name: types.string,
  type: types.string,
  invitedAt: types.Date,
});

export const InvitationsModel = types
  .model({
    incoming: types.map(Invite), // Map<SpacePath, Invite>
    outgoing: types.map(types.map(Invite)), // Map<SpacePath, Map<Patp, Invite>>
  })
  .views((self) => ({
    get invitations() {
      return self.incoming;
    },
    get sent() {
      return self.outgoing;
    },
    sentByPlace(placePath: string) {
      return self.outgoing.get(placePath);
    },
  }))
  .actions((self) => ({
    initial(data: any) {
      // set initial data
    },
    addIncoming(data: any) {
      // update incoming invitations
    },
    updateIncoming(data: any) {
      // update incoming invitations
    },
    removeIncoming(data: any) {
      // update incoming invitations
    },
    addOutgoing(data: any) {
      // update outgoing invitations
    },
    updateOutgoing(data: any) {
      // update outgoing invitations
    },
    removeOutgoing(data: any) {
      // update outgoing invitations
    },
  }));
