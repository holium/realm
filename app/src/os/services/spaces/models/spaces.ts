import {
  Instance,
  types,
  applySnapshot,
  castToSnapshot,
} from 'mobx-state-tree';
import { toJS } from 'mobx';
import { ThemeModel } from '../../shell/theme.model';
import { LoaderModel } from '../../common.model';
import { DocketApp, WebApp } from '../../ship/models/docket';
import { InvitationsModel } from './invitations';

import { TokenModel } from './token';
// import { FriendsStore } from '../../ship/models/friends';
import { MembersModel, MembersStore } from './members';
import { Patp } from 'os/types';

export const DocketMap = types.map(
  types.union({ eager: false }, DocketApp, WebApp)
);

export const SpaceModel = types
  .model('SpaceModel', {
    path: types.identifier,
    name: types.string,
    color: types.maybeNull(types.string),
    type: types.enumeration(['group', 'our', 'space']),
    archetype: types.optional(types.enumeration(['home', 'lodge']), 'home'), //TODO remove the optional
    picture: types.maybeNull(types.string),
    theme: ThemeModel,
    token: types.maybe(TokenModel),
    invitations: types.optional(InvitationsModel, {
      outgoing: {},
      incoming: {},
    }),
    members: types.optional(MembersStore, { all: {} }),
    apps: types.maybe(
      types.model({
        pinned: types.array(types.string),
        endorsed: DocketMap, // recommended
        installed: DocketMap, // registered
      })
    ),
  })
  .views((self) => ({}))
  .actions((self) => ({}));

export type SpaceModelType = Instance<typeof SpaceModel>;

export const SpacesStore = types
  .model('SpacesStore', {
    loader: types.optional(LoaderModel, { state: 'initial' }),
    selected: types.safeReference(SpaceModel),
    spaces: types.map(SpaceModel),
    // friends: types.optional(FriendsStore, { all: {} }),
  })
  .views((self) => ({
    get isLoading() {
      return self.loader.state === 'loading';
    },
    get isLoaded() {
      return self.loader.state === 'loaded';
    },
    get spacesList() {
      return Array.from(self.spaces.values()).filter(
        (space: SpaceModelType) => space.type !== 'our'
      );
    },
    getSpaceByPath(spacePath: string) {
      // if (spacePath === self.our!.path) {
      //   return self.our;
      // } else {
      return self.spaces.get(spacePath)!;
      // }
    },
  }))
  .actions((self) => ({
    initialScry: (data: any, persistedState: any, ship: Patp) => {
      Object.entries(data).forEach(
        ([path, space]: [path: string, space: any]) => {
          console.log(path, space);
          // const persistedData =
          //   persistedState && persistedState.spaces
          //     ? persistedState.spaces[path].members
          //     : {};
          data[path].members = {};
        }
      );
      applySnapshot(self.spaces, data);

      if (!self.selected) self.selected = self.getSpaceByPath(`/${ship}/our`);
    },
    initialSync: (syncEffect: { key: string; model: typeof self }) => {
      applySnapshot(self, castToSnapshot(syncEffect.model));
      self.loader.set('loaded');
    },
    initialReaction: (data: { spaces: any; members: any }) => {
      Object.keys(data.spaces).forEach((key: string) => {
        // if (!data.spaces[key].members) {
        //   data.spaces[key].members = { all: {} };
        // }
        // data.spaces[key].members = MembersStore.create({
        //   all: data.members[key],
        // });
      });
      applySnapshot(self.spaces, castToSnapshot(data.spaces));
    },
    addSpace: (addReaction: { space: any; membership: any }) => {
      const space = addReaction.space;
      const newSpace = SpaceModel.create(space);
      newSpace.members?.initial(addReaction.membership);
      self.spaces.set(space.path, newSpace);
      return newSpace.path;
    },
    updateSpace: (replaceReaction: { space: any }) => {
      const members = self.spaces.get(replaceReaction.space.path)?.members;
      self.spaces.set(replaceReaction.space.path, {
        ...replaceReaction.space,
        members,
      });
    },
    deleteSpace: (deleteReaction: { 'space-path': string }) => {
      const path = deleteReaction['space-path'];
      self.spaces.delete(path);
      return path;
    },
    setLoader(status: 'initial' | 'loading' | 'error' | 'loaded') {
      self.loader.state = status;
    },
    setOurSpace(ourSpace: any) {
      // self.our = ourSpace;
      if (!self.selected) self.selected = ourSpace;
    },
    selectSpace(spacePath: string) {
      self.selected = self.spaces.get(spacePath)!;
      return self.selected!;
    },
  }));

export type SpacesStoreType = Instance<typeof SpacesStore>;
