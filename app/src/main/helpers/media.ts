import { ipcMain, systemPreferences } from 'electron';
import { BrowserWindow } from 'electron/main';
import { download } from 'electron-dl';

import { MediaAccess, MediaAccessStatus } from '../../os/types';
import { isMac, isWindows } from './env';

const registerListeners = () => {
  ipcMain.handle('ask-for-mic', async (): Promise<MediaAccessStatus> => {
    await systemPreferences.askForMediaAccess('microphone');
    return systemPreferences.getMediaAccessStatus('microphone');
  });
  ipcMain.handle('ask-for-camera', async (): Promise<MediaAccessStatus> => {
    await systemPreferences.askForMediaAccess('camera');
    return systemPreferences.getMediaAccessStatus('camera');
  });

  ipcMain.handle('get-media-status', (_event): MediaAccess => {
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

  ipcMain.on('download-url-as-file', (_event, { url }) => {
    const win = BrowserWindow.getFocusedWindow();
    if (win) {
      download(win, url, { saveAs: true });
    }
  });
};

export const MediaHelper = { registerListeners };
