import {
  Instance,
  types,
  applySnapshot,
  castToSnapshot,
} from 'mobx-state-tree';
import { LoaderModel, SubscriptionModel } from './common.model';
import { DocketApp, WebApp } from './bazaar.model';
import { MembersStore, VisaModel } from './members.model';
import { Theme } from './theme.model';

export const DocketMap = types.map(
  types.union({ eager: false }, DocketApp, WebApp)
);

export const SpaceModel = types
  .model('SpaceModel', {
    path: types.identifier,
    name: types.string,
    description: types.optional(types.string, ''),
    color: types.optional(types.string, '#000000'),
    type: types.enumeration(['group', 'our', 'space']),
    archetype: types.optional(types.enumeration(['home', 'community']), 'home'), // TODO remove the optional
    picture: types.optional(types.string, ''),
    access: types.optional(types.string, 'public'),
    theme: Theme,
    invitations: types.optional(VisaModel, {
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
  .views(() => ({}))
  .actions(() => ({}));

export type SpaceModelType = Instance<typeof SpaceModel>;

export const SpacesStore = types
  .model('SpacesStore', {
    loader: types.optional(LoaderModel, { state: 'initial' }),
    join: types.optional(LoaderModel, { state: 'initial' }),
    selected: types.safeReference(SpaceModel),
    spaces: types.map(SpaceModel),
    // friends: types.optional(FriendsStore, { all: {} }),
    subscription: types.optional(SubscriptionModel, {
      state: 'subscribing',
    }),
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
    get ourSpace() {
      return Array.from(self.spaces.values()).filter(
        (space: SpaceModelType) => space.type === 'our'
      )[0];
    },
    getSpaceByPath(spacePath: string) {
      // if (spacePath === self.our.path) {
      //   return self.our;
      // } else {
      return self.spaces.get(spacePath);
      // }
    },
    get subscriptionState() {
      return self.subscription.state;
    },
  }))
  .actions((self) => ({
    initialSync: (syncEffect: { key: string; model: typeof self }) => {
      // console.log('initial %spaces sync');
      applySnapshot(self, castToSnapshot(syncEffect.model));
      self.loader.set('loaded');
    },
    initialReaction: (data: { spaces: any; members: any }, ship: string) => {
      Object.keys(data.spaces).forEach((key: string) => {
        // if (!data.spaces[key].members) {
        //   data.spaces[key].members = { all: {} };
        // }
        // data.spaces[key].members = MembersStore.create({
        //   all: data.members[key],
        // });
        data.spaces[key].theme.id = `${key}`;
      });
      // self.loader.set('loaded');
      applySnapshot(self.spaces, castToSnapshot(data.spaces));
      if (!self.selected) self.selected = self.getSpaceByPath(`/${ship}/our`);
      self.loader.state = 'loaded';
      console.log(self.loader.state);
    },
    addSpace: (addReaction: { space: any; members: any }) => {
      const space = addReaction.space;
      const newSpace = SpaceModel.create({
        ...space,
        theme: {
          id: space.path,
          ...space.theme,
        },
      });
      // newSpace.members?.initial(addReaction.members);
      self.spaces.set(space.path, newSpace);
      return newSpace.path;
    },
    updateSpace: (replaceReaction: { space: any }) => {
      const members = self.spaces.get(replaceReaction.space.path)?.members;
      replaceReaction.space.theme.id = replaceReaction.space.path;
      self.spaces.set(replaceReaction.space.path, {
        ...replaceReaction.space,
        members,
      });
    },
    deleteSpace: (
      ourSpace: string,
      deleteReaction: { 'space-path': string },
      setTheme: (theme: any) => void
    ) => {
      const path = deleteReaction['space-path'];
      //
      if (path === self.selected?.path) {
        // set to our space
        self.selected = self.spaces.get(ourSpace);
        console.log(self.selected?.path);
        setTheme(self.selected?.theme);
      }
      self.spaces.delete(path);
      return path;
    },
    setLoader(status: 'initial' | 'loading' | 'error' | 'loaded') {
      self.loader.state = status;
    },
    setJoin(status: 'initial' | 'loading' | 'error' | 'loaded') {
      self.join.state = status;
    },
    setOurSpace(ourSpace: any) {
      // self.our = ourSpace;
      if (!self.selected) self.selected = ourSpace;
    },
    selectSpace(spacePath: string) {
      self.selected = self.spaces.get(spacePath);
      return self.selected;
    },
    setSubscriptionStatus: (
      newSubscriptionStatus: 'subscribed' | 'subscribing' | 'unsubscribed'
    ) => {
      self.subscription.set(newSubscriptionStatus);
    },
  }));

export type SpacesStoreType = Instance<typeof SpacesStore>;
