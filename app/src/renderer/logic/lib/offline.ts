import { OSActions } from '../actions/os';
import { CoreInstance } from '../store';

export const watchOnlineStatus = (coreStore: CoreInstance) => {
  window.removeEventListener('online', () => {});
  window.removeEventListener('offline', () => {});

  window.addEventListener('online', () => {
    console.log('online detected, reconnecting...');
    coreStore.setOnline(true);
    OSActions.reconnect();
  });
  window.addEventListener('offline', () => {
    console.log('offline detected, cleaning up...');
    OSActions.disconnect();
    coreStore.setOnline(false);
  });
};
