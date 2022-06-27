import { types, Instance, flow } from 'mobx-state-tree';
import { DocketApp, WebApp } from '../../ship/stores/docket';
import { ThemeModel } from '../../theme/store';
import { TokenModel } from './token';

const DocketMap = types.map(types.union({ eager: false }, DocketApp, WebApp));

export const SpaceModel = types
  .model({
    path: types.string,
    name: types.string,
    type: types.enumeration(['group', 'our', 'dao']),
    picture: types.maybeNull(types.string),
    theme: ThemeModel,
    token: types.maybe(TokenModel),
    apps: types.model({
      pinned: types.array(types.string),
      endorsed: DocketMap,
      installed: DocketMap,
    }),
  })
  .views((self) => ({}))
  .actions((self) => ({
    initialize: flow(function* () {
      // const [response, error] = yield getApps((_event: any, value: any) =>
      //   console.log(value)
      // );
      // if (error) throw error;
      // console.log(response);
    }),
  }));

export type SpaceModelType = Instance<typeof SpaceModel>;

export const SpacesStore = types
  .model({
    our: types.maybeNull(SpaceModel),
    spaces: types.array(SpaceModel),
  })
  .views((self) => ({}))
  .actions((self) => ({
    setInitial(spaces: any) {
      const ourSpace: any = Object.values(spaces).find(
        (space: any) => space.type === 'our'
      );
      self.our = SpaceModel.create({
        ...ourSpace,
        theme: { ...ourSpace.theme, themeId: ourSpace.spaceId },
        path: ourSpace.spaceId,
      });
    },
  }));

export type SpacesStoreType = Instance<typeof SpacesStore>;
