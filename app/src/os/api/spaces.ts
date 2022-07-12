import { Urbit } from './../urbit/api';
import { SpacesStoreType } from '../services/spaces/models/spaces';
// import { cleanNounColor } from '../lib/color';

export const SpacesApi = {
  syncUpdates: (conduit: Urbit, state: SpacesStoreType): void => {
    conduit.subscribe({
      app: 'spaces',
      path: `/updates`,
      event: async (data: any) => {
        console.log(data);
        switch (data['spaces-reaction']) {
          case 'initial':
            break;
          case 'create':
            break;
          case 'edit':
            break;
          case 'delete':
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
