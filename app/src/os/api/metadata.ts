import { Conduit } from '@holium/conduit';

export const MetadataApi = {
  syncGraphMetadata: async (
    conduit: Conduit,
    metadataStore: any
  ): Promise<any> => {
    return conduit.watch({
      app: 'metadata-store',
      path: '/app-name/graph',
      onEvent: (data: any) => {
        if (data['metadata-update'] && data['metadata-update'].associations) {
          Object.assign(
            metadataStore['graph'],
            data['metadata-update'].associations
          );
        }
      },

      onError: () => console.log('Subscription rejected'),
      onQuit: () => console.log('Kicked from subscription'),
    });
  },
};
