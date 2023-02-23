import { ipcMain, systemPreferences } from 'electron';
import { isMac, isWindows } from './env';

const registerListeners = () => {
  ipcMain.handle('ask-for-mic', async (_event) => {
    await systemPreferences.askForMediaAccess('microphone');
    return systemPreferences.getMediaAccessStatus('microphone');
  });
  ipcMain.handle('ask-for-camera', async (_event) => {
    await systemPreferences.askForMediaAccess('camera');
    return systemPreferences.getMediaAccessStatus('camera');
  });

  ipcMain.handle('get-media-status', async (_event) => {
    if (!isMac && !isWindows) {
      return {
        camera: 'unknown',
        mic: 'unknown',
      };
    }

    const camera = systemPreferences.getMediaAccessStatus('camera');
    const mic = systemPreferences.getMediaAccessStatus('microphone');

    return {
      camera,
      mic,
    };
  });

  // ipcMain.handle(
  //   'set-media-status',
  //   async (_event, mediaType: 'camera' | 'mic', enabled: boolean) => {
  //     const camera = systemPreferences.getMediaAccessStatus('camera');
  //     systemPreferences.medi('microphone');

  //     return {
  //       camera,
  //       mic: systemPreferences.getMediaAccessStatus('microphone'),
  //     };
  //   }
  // );
};

export const MediaHelper = { registerListeners };
