import { ISession } from './../index';
import { quickPoke } from '../lib/poke';
import { Urbit } from './../urbit/api';
import { SpacesStoreType } from '../services/spaces/models/spaces';
import { snakeify } from '../lib/obj';
// import { cleanNounColor } from '../lib/color';

export const PassportsApi = {
  getPassports: async (conduit: Urbit, path: string) => {
    const response = await conduit.scry({
      app: 'passports',
      path: `${path}/passports`, // the spaces scry is at the root of the path
    });
    return response.passports;
  },

  syncUpdates: (conduit: Urbit, state: SpacesStoreType): void => {
    conduit.subscribe({
      app: 'spaces',
      path: `/updates`,
      event: async (data: any) => {
        switch (data['spaces-reaction']) {
          case 'initial':
            // console.log(data['spaces-reaction']);
            break;
          case 'add':
            console.log(data['spaces-reaction']['add']);
            break;
          case 'replace':
            console.log(data['spaces-reaction']['replace']);
            break;
          case 'remove':
            break;
          default:
            // unknown
            break;
        }
      },
      err: () => console.log('Subscription rejected'),
      quit: () => console.log('Kicked from subscription'),
    });
  },
};
