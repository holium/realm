import {
  applySnapshot,
  castToSnapshot,
  cast,
  Instance,
  types,
} from 'mobx-state-tree';
import { toJS } from 'mobx';

const Roles = types.enumeration([
  'initiate',
  'member',
  'admin',
  'owner',
  'moderator',
]);
export type RolesType = Instance<typeof Roles>;
const Status = types.enumeration(['invited', 'joined', 'host']);

export const MembersModel = types
  .model({
    roles: types.array(Roles),
    alias: types.maybe(types.string),
    status: Status,
  })
  .actions((self) => ({
    setRoles(roles: RolesType[]) {
      self.roles = cast(roles);
    },
  }));

export type MemberType = Instance<typeof MembersModel>;

const generateMemberList = (entries: any) => {
  return Array.from(entries).map((entry: any) => {
    return {
      ...entry[1],
      patp: entry[0],
    };
  });
};

export const MembershipStore = types
  .model('MembershipStore', {
    selected: types.safeReference(types.map(MembersModel)),
    spaces: types.map(types.map(MembersModel)),
  })
  .views((self) => ({
    isAdmin(path: string, patp: string) {
      const member = self.spaces.get(path)?.get(patp);
      if (!member) return false;
      return member.roles?.includes('admin');
    },
    getMemberCount(path: string) {
      const members = self.spaces.get(path);
      if (!members) return 0;
      const list = Array.from(members.values()).filter(
        (mem: MemberType) => mem.status !== 'invited'
      );
      return list.length;
    },
    getSpaceMembers(path: string) {
      const members = self.spaces.get(path);
      if (!members) return types.map(MembersModel).create();
      return members;
    },
    getMembersList(path: string) {
      const members = self.spaces.get(path);
      if (!members) return [];
      return generateMemberList(members.entries());
    },
  }))
  .actions((self) => ({
    initial(spaceMembersMap: any) {
      // console.log('here', spaceMembersMap);
      applySnapshot(self.spaces, spaceMembersMap);
    },
    addMemberMap(path: string, membersMap: any) {
      self.spaces.set(path, cast(membersMap));
    },
    removeMemberMap(path: string) {
      self.spaces.delete(path);
    },
    addMember(path: string, patp: string, member: MemberType) {
      const members = self.spaces.get(path);
      members && members.set(patp, cast(member));
    },
    updateMember(path: string, patp: string, member: MemberType) {
      const members = self.spaces.get(path);
      members && members.set(patp, cast(member));
    },
    removeMember(path: string, patp: string) {
      const members = self.spaces.get(path);
      members && members.delete(patp);
    },
    setSpace(path: string) {
      const members = self.spaces.get(path);
      if (members) self.selected = members;
    },
    editMember(path: string, patp: string, roles: RolesType[]) {
      const members = self.spaces.get(path);
      members?.get(patp)?.setRoles(roles);
    },
  }));

export type MembershipType = Instance<typeof MembershipStore>;

export const MembersStore = types
  .model('MembersStore', {
    all: types.map(MembersModel),
  })
  .views((self) => ({
    get count() {
      return self.all.size;
    },
    get initiates() {
      return Array.from(self.all.entries())
        .filter((value: [patp: string, friend: MemberType]) =>
          value[1].roles.includes('initiate')
        )
        .map((value: [patp: string, friend: MemberType]) =>
          toJS({
            patp: value[0],
            status: value[1].status,
            roles: value[1].roles,
          })
        );
    },
    get members() {
      return Array.from(self.all.entries())
        .filter((value: [patp: string, friend: MemberType]) =>
          value[1].roles.includes('member')
        )
        .map((value: [patp: string, friend: MemberType]) =>
          toJS({
            patp: value[0],
            status: value[1].status,
            roles: value[1].roles,
          })
        );
    },
    get admins() {
      return Array.from(self.all.entries())
        .filter((value: [patp: string, friend: MemberType]) =>
          value[1].roles.includes('admin')
        )
        .map((value: [patp: string, friend: MemberType]) =>
          toJS({
            patp: value[0],
            status: value[1].status,
            roles: value[1].roles,
          })
        );
    },
    get list() {
      return Array.from(self.all.entries()).map(
        (value: [patp: string, friend: MemberType]) =>
          toJS({
            patp: value[0],
            status: value[1].status,
            roles: value[1].roles,
          })
      );
    },
  }))
  .actions((self) => ({
    initial(members: typeof self.all) {
      applySnapshot(self.all, castToSnapshot(members));
    },
    add(patp: string, friend: MemberType) {
      self.all.set(patp, friend);
    },
    update(patp: string, update: any) {
      self.all.set(patp, update);
    },
    remove(patp: string) {
      self.all.delete(patp);
    },
  }));

export type MembersType = Instance<typeof MembersStore>;

export const Visa = types.model('Visa', {
  inviter: types.string,
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
  .model('VisaModel', {
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
    initial(_data: any) {
      // console.log(data);
      // set initial data
    },
    initialIncoming(data: any) {
      if (data) applySnapshot(self.incoming, data);
    },
    addIncoming(data: { path: string; invite: VisaType }) {
      // update incoming invitations
      self.incoming.set(data.path, data.invite);
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
