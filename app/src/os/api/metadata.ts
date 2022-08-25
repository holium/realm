import { Urbit } from '../urbit/api';

export const MetadataApi = {
  syncGraphMetadata: async (
    conduit: Urbit,
    metadataStore: any
  ): Promise<number> => {
    return conduit.subscribe({
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
