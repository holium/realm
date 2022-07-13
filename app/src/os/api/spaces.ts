import { Urbit } from './../urbit/api';
import { SpacesStoreType } from '../services/spaces/models/spaces';
// import { cleanNounColor } from '../lib/color';

export const SpacesApi = {
  syncUpdates: (conduit: Urbit, state: SpacesStoreType): void => {
    conduit.subscribe({
      app: 'spaces',
      path: `/updates`,
      event: async (data: any) => {
        console.log(data['spaces-reaction']);
        switch (data['spaces-reaction']) {
          case 'initial':
            break;
          case 'add':
            console.log(data['spaces-reaction']['add']);
            break;
          case 'replace':
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
