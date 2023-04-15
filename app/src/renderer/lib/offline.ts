import { AppStateType } from 'renderer/stores/app.store';
// import { MainIPC } from 'renderer/stores/ipc';

export const watchOnlineStatus = (appState: AppStateType) => {
  window.removeEventListener('online', () => {});
  window.removeEventListener('offline', () => {});

  window.addEventListener('online', () => {
    console.log('online detected, reconnecting...');
    appState.setOnline(true);
    // MainIPC.reconnect();
  });
  window.addEventListener('offline', () => {
    console.log('offline detected, cleaning up...');
    // MainIPC.disconnect();
    appState.setOnline(false);
  });
};
