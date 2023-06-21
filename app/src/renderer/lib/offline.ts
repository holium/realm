import { AppStateType } from 'renderer/stores/app.store';
import { RealmIPC } from 'renderer/stores/ipc';

export const watchOnlineStatus = (appState: AppStateType) => {
  window.removeEventListener('online', () => {});
  window.removeEventListener('offline', () => {});

  window.addEventListener('online', () => {
    console.log('online detected, reconnecting...');
    appState.setOnline(true);
    RealmIPC.reconnectConduit();
  });
  window.addEventListener('offline', () => {
    console.log('offline detected, cleaning up...');
    // MainIPC.disconnect();
    appState.setOnline(false);
    RealmIPC.setConduitStatus('no-internet');
  });
};
