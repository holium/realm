import { types, Instance } from 'mobx-state-tree';

// :~  title+'Realm'
//     info+'A desktop environment for DAOs and communities. Developed by Holium.'
//     color+0xce.bef0
//     image+'https://lomder-librun.sfo3.digitaloceanspaces.com/tiles/ballot-app-tile.svg'
//     glob-http+['https://lomder-librun.sfo3.digitaloceanspaces.com/globs/glob-0v28ktr.ujaup.832r3.fbs8q.b9ssn.glob' 0v28ktr.ujaup.832r3.fbs8q.b9ssn]
//     base+'realm'
//     version+[0 0 1]
//     website+'https://holium.com'
//     license+'MIT'
// ==
export const AppModel = types.model({
  title: types.string,
  info: types.string,
  color: types.string,
  image: types.string,
  globHttp: types.string,
  base: types.string,
  version: types.array(types.number),
  website: types.string,
  license: types.string,
});
export type AppModelType = Instance<typeof AppModel>;

export const DocketStore = types
  .model({
    apps: types.array(AppModel),
    pinned: types.array(types.reference(AppModel)),
  })
  .views((self) => ({}))
  .actions((self) => ({}));

export type DocketStoreType = Instance<typeof DocketStore>;
