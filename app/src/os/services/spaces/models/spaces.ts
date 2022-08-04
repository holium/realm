import {
  Instance,
  types,
  applySnapshot,
  castToSnapshot,
  clone,
  applyPatch,
} from 'mobx-state-tree';
import { toJS } from 'mobx';
import { ThemeModel } from '../../shell/theme.model';
import { LoaderModel } from '../../common.model';
import { DocketApp, WebApp } from '../../ship/models/docket';
import { InvitationsModel } from './invitations';

import { TokenModel } from './token';
import { FriendsStore } from './friends';
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
    members: types.maybe(MembersStore),
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
    friends: types.optional(FriendsStore, { all: {} }),
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
          const persistedData =
            persistedState && persistedState.spaces
              ? persistedState.spaces[path]
              : {};
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
    initialReaction: (data: { spaces: any; membership: any }) => {
      Object.keys(data.spaces).forEach((key: string) => {
        data.spaces[key].members = data.membership[key];
      });
      applySnapshot(self.spaces, castToSnapshot(data.spaces));
    },
    addSpace: (addReaction: any) => {
      const space = addReaction['spaces-reaction'].add.space;
      space.apps = {
        pinned: [],
        endorsed: {},
        installed: {},
      };
      const newSpace = SpaceModel.create(space);
      self.spaces.set(space.path, SpaceModel.create(space));
      return newSpace;
    },
    updateSpace: (spacePath: string, update: any) => {
      console.log(spacePath, update);
    },
    deleteSpace: (deleteReaction: any) => {
      const path = deleteReaction['spaces-reaction'].remove['space-path'];
      // if (self.selected === path) self.selected = self.our; // TODO do this outside of this function
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
