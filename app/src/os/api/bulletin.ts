import { Conduit } from '@holium/conduit';
import { BulletinStoreType } from '../services/spaces/models/bulletin';

export const BulletinApi = {
  watchUpdates: async (
    conduit: Conduit,
    store: BulletinStoreType
  ): Promise<any> => {
    return await conduit.watch({
      app: 'bulletin',
      path: `/ui`,
      onEvent: async (data: any) => {
        const [action, payload] = Object.entries<any>(data)[0];
        switch (action) {
          case 'initial':
            store._initial(payload);
            break;
          case 'space-added':
            store._spaceAdded(payload.space);
            break;
          case 'space-removed':
            store._spaceRemoved(payload);
            break;
        }
      },
      onSubscribed: () => {
        store.setSubscriptionStatus('subscribed');
      },
      onError: () => {
        console.error('Subscription to %bulletin rejected');
        store.setSubscriptionStatus('unsubscribed');
      },
      onQuit: () => {
        console.error('Kicked from %bulletin subscription');
        store.setSubscriptionStatus('unsubscribed');
      },
    });
  },
};
