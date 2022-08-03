/***********************
 * bazaar agent API
 *   all scrying and actions (pokes) should be supported here
 */
import { Urbit } from './../urbit/api';

export const BazaarApi = {
  //  to get all apps on a ship, path should be /{ship}
  //  to get all apps on a ship for a given space,
  //    path should be /{ship}/{space-path}
  getApps: async (conduit: Urbit, ship: string) => {
    const response = await conduit.scry({
      app: 'bazaar',
      path: `/apps/${ship}`, // the spaces scry is at the root of the path
    });
    return response.apps;
  },
};
