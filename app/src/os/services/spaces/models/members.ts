import {
  applySnapshot,
  castToSnapshot,
  cast,
  Instance,
  types,
} from 'mobx-state-tree';
import { toJS } from 'mobx';
import { Patp, SpacePath } from '../../../types';
// import { InvitationsModel } from './invitations';

const Roles = types.enumeration(['initiate', 'member', 'admin', 'owner']);
const Status = types.enumeration(['invited', 'joined', 'host']);

export const MembersModel = types.model({
  roles: types.array(Roles),
  alias: types.maybe(types.string),
  status: Status,
});

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
    isAdmin(path: string, patp: Patp) {
      const roles = self.spaces.get(path)?.get(patp)!.roles;
      return roles?.includes('admin');
    },
    getMemberCount(path: SpacePath) {
      const members = self.spaces.get(path);
      if (!members) return 0;
      const list = Array.from(members.values()).filter(
        (mem: MemberType) => mem.status !== 'invited'
      );
      return list.length;
    },
    getSpaceMembers(path: SpacePath) {
      const members = self.spaces.get(path);
      if (!members) return {};
      return members;
    },
    getMembersList(path: SpacePath) {
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
    addMemberMap(path: SpacePath, membersMap: any) {
      self.spaces.set(path, cast(membersMap));
    },
    removeMemberMap(path: SpacePath) {
      self.spaces.delete(path);
    },
    addMember(path: SpacePath, patp: Patp, member: MemberType) {
      const members = self.spaces.get(path);
      members && members.set(patp, cast(member));
    },
    updateMember(path: SpacePath, patp: Patp, member: MemberType) {
      const members = self.spaces.get(path);
      members && members.set(patp, cast(member));
    },
    removeMember(path: SpacePath, patp: Patp) {
      const members = self.spaces.get(path);
      members && members.delete(patp);
    },
    setSpace(path: SpacePath) {
      const members = self.spaces.get(path);
      if (members) self.selected = members;
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
    add(patp: Patp, friend: MemberType) {
      self.all.set(patp, friend);
    },
    update(patp: Patp, update: any) {
      self.all.set(patp, update);
    },
    remove(patp: Patp) {
      self.all.delete(patp);
    },
  }));

export type MembersType = Instance<typeof MembersStore>;
