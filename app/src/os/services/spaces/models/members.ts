import {
  applySnapshot,
  castToSnapshot,
  Instance,
  types,
} from 'mobx-state-tree';
import { toJS } from 'mobx';
import { Patp } from '../../../types';

const Roles = types.enumeration(['initiate', 'member', 'admin', 'owner']);
const Status = types.enumeration(['invited', 'joined', 'host']);

export const MembersModel = types.model({
  roles: types.array(Roles),
  status: Status,
});

export type MemberType = Instance<typeof MembersModel>;

export const MembersStore = types
  .model({ all: types.map(MembersModel) })
  .views((self) => ({
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
