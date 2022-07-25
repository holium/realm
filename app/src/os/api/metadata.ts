import { Urbit } from '../urbit/api';

export const MetadataApi = {
  syncGroupMetadata: async (
    conduit: Urbit,
    metadataStore: { [key: string]: any }
  ) => {
    return new Promise((resolve, reject) => {
      conduit.subscribe({
        app: 'metadata-store',
        path: '/app-name/groups',
        event: (data: any) => {
          if (data['metadata-update'] && data['metadata-update'].associations) {
            Object.assign(
              metadataStore['groups'],
              data['metadata-update'].associations
            );
          }
          resolve(null);
        },
        err: () => reject('Subscription rejected'),
        quit: () => console.log('Kicked from subscription'),
      });
    });
  },
  syncGraphMetadata: async (conduit: Urbit, metadataStore: any) => {
    conduit.subscribe({
      app: 'metadata-store',
      path: '/app-name/graph',
      event: (data: any) => {
        if (data['metadata-update'] && data['metadata-update'].associations) {
          Object.assign(
            metadataStore['graph'],
            data['metadata-update'].associations
          );
        }
      },
      err: () => console.log('Subscription rejected'),
      quit: () => console.log('Kicked from subscription'),
    });
  },
};
