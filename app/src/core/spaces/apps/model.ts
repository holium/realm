import { types, Instance, flow } from 'mobx-state-tree';

export const AppModel = types.model({
  title: types.string,
  info: types.string,
  color: types.string,
  image: types.string,
  'glob-http': types.maybeNull(types.string),
  base: types.string,
  version: types.array(types.number),
  website: types.string,
  license: types.string,
});
export type AppModelType = Instance<typeof AppModel>;

// /**
//  * Install a foreign desk
//  */
// export function kilnInstall(
//   ship: string,
//   desk: string,
//   local?: string
// ): Poke<any> {
//   return {
//     app: 'hood',
//     mark: 'kiln-install',
//     json: {
//       ship,
//       desk,
//       local: local || desk
//     }
//   };
// }
