import { types, Instance, flow } from 'mobx-state-tree';
import { getApps } from '../../renderer/logic/app/api';
import { AppModel } from './apps/model';

export const SpaceStore = types
  .model({
    apps: types.array(AppModel),
    pinned: types.array(types.reference(AppModel)),
  })
  .views((self) => ({}))
  .actions((self) => ({
    initialize: flow(function* () {
      const [response, error] = yield getApps((_event: any, value: any) =>
        console.log(value)
      );
      if (error) throw error;
      console.log(response);
    }),
  }));

export type SpaceStoreType = Instance<typeof SpaceStore>;
