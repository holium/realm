import { average, prominent } from 'color.js';
// const colors = ['#005050', '#000000', '#505050', '#000050', '#a05050'];
// ['#005050', '#000000']
// ['#f0a0a0', '#a0a0a0', '#a0f0f0', '#f0f0f0', '#f0f0a0']
/**
 * DesktopActions for interfacing with core process
 */
export const SoundActions = {
  playSound: async (soundbite: string) => {
    switch (soundbite) {
      case 'startup':
        SoundActions.playStartup();
        return;
      case 'login':
        SoundActions.playLogin();
        return;
      case 'system-notification':
        SoundActions.playSystemNotification();
        return;
      case 'error':
        SoundActions.playError();
        return;
      case 'dm-notify':
        SoundActions.playDMNotify();
        return;
      case 'dm-send':
        SoundActions.playDMSend();
        return;
      default:
        console.warn(`playSound unrecognized sound '{soundbite}'`);
    }
  },
  playStartup: async () => {},
  playLogin: async () => {},
  playSystemNotification: async () => {},
  playError: async () => {},
  playDMNotify: async () => {},
  playDMSend: async () => {},
};
