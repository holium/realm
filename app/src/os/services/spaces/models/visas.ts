import {
  Instance,
  types,
  applySnapshot,
  castToSnapshot,
  clone,
  applyPatch,
} from 'mobx-state-tree';

export const Visa = types.model({
  inviter: types.string,
  patp: types.string,
  role: types.string,
  message: types.string,
  path: types.string,
  name: types.string,
  type: types.string,
  picture: types.maybeNull(types.string),
  color: types.maybeNull(types.string),
  invitedAt: types.Date,
});

export type VisaType = Instance<typeof Visa>;

export const VisaModel = types
  .model({
    incoming: types.map(Visa), // Map<SpacePath, Invite>
    outgoing: types.map(types.map(Visa)), // Map<SpacePath, Map<Patp, Invite>>
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
      console.log(data);
      // set initial data
    },
    addIncoming(data: any) {
      // update incoming invitations
      self.incoming.set(data.path, data);
    },
    updateIncoming(data: any) {
      // update incoming invitations
      self.incoming.set(data.path, data);
    },
    removeIncoming(path: string) {
      // update incoming invitations
      self.incoming.delete(path);
    },
    addOutgoing(data: any) {
      // update outgoing invitations
      self.outgoing.set(data.path, data);
    },
    updateOutgoing(data: any) {
      // update outgoing invitations
      self.outgoing.set(data.path, data);
    },
    removeOutgoing(path: string) {
      // update outgoing invitations
      self.outgoing.delete(path);
    },
  }));

export type VisaModelType = Instance<typeof VisaModel>;
