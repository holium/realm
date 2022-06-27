import { Urbit } from '../urbit/api';

export const MetadataApi = {
  syncGroupMetadata: async (
    conduit: Urbit,
    metadataStore: { [key: string]: any }
  ) => {
    conduit.subscribe({
      app: 'metadata-store',
      path: '/app-name/groups',
      event: (data: any) => {
        // stateTree.
        Object.assign(metadataStore, data['metadata-update'].associations); //.data['metadata-update'].associations;
      },
      err: () => console.log('Subscription rejected'),
      quit: () => console.log('Kicked from subscription'),
    });
  },
  syncGraphMetadata: async (conduit: Urbit, metadataStore: any) => {
    conduit.subscribe({
      app: 'metadata-store',
      path: '/app-name/graph',
      event: (data: any) => {
        // stateTree.
        Object.assign(metadataStore, data['metadata-update'].associations); //.data['metadata-update'].associations;
      },
      err: () => console.log('Subscription rejected'),
      quit: () => console.log('Kicked from subscription'),
    });
  },
};
