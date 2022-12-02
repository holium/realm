import { Conduit } from '@holium/conduit';

export const BeaconApi = {
  // get a list of notification providers from beacon
  //  (e.g. hark-store, hark (new), beacon, et. al...)
  getProviders: async (conduit: Conduit) => {
    const response = await conduit.scry({
      app: 'beacon',
      path: `/providers`,
    });
    return response.providers;
  },
  // get new notifications (anything not yet read/seen)
  getLatest: async (conduit: Conduit, provider: string) => {
    const response = await conduit.scry({
      app: 'beacon',
      path: `${provider}/latest`,
    });
    return response.latest;
  },
};
