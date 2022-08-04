/***********************
 * bazaar agent API
 *   all scrying and actions (pokes) should be supported here
 */
import { Urbit } from './../urbit/api';
import { quickPoke } from '../lib/poke';
import { docketInstall } from '@urbit/api';
import { ISession } from '../';

export const BazaarApi = {
  //  to get all apps on a ship, path should be /{ship}
  //  to get all apps on a ship for a given space,
  //    path should be /{ship}/{space-path}
  getApps: async (
    conduit: Urbit,
    shipName: string,
    shipPath: string,
    category: string = 'all'
  ) => {
    const response = await conduit.scry({
      app: 'bazaar',
      path: `/apps/${shipName}/${shipPath}/${category}`,
    });
    return response.apps;
  },
  //  leverage treaty to get list of allies for 'our' ship
  getAllies: async (conduit: Urbit) => {
    const response = await conduit.scry({
      app: 'bazaar',
      path: `/allies`,
    });
    return response.ini;
  },
  //  leverage treaty to get list of treaties for the specified ship
  getTreaties: async (conduit: Urbit, ship: string) => {
    const response = await conduit.scry({
      app: 'bazaar',
      path: `/treaties/${ship}`,
    });
    return response.apps;
  },
  installApp: async (
    ourShip: string,
    ship: string,
    desk: string,
    credentials: ISession
  ) => {
    return await quickPoke(ourShip, docketInstall(ship, desk), credentials);
  },
};
