import {
  BrowserWindow,
  desktopCapturer,
  ipcMain,
  Menu,
  systemPreferences,
} from 'electron';
import { download } from 'electron-dl';
import log from 'electron-log';

import { MediaAccess, MediaAccessStatus } from '../../os/types';
import { isMac, isWindows } from './env';

const registerListeners = (mainWindow: BrowserWindow) => {
  ipcMain.removeHandler('ask-for-mic');
  ipcMain.removeHandler('ask-for-camera');
  ipcMain.removeHandler('ask-for-screen');
  ipcMain.removeHandler('get-media-status');
  ipcMain.removeHandler('download-url-as-file');

  ipcMain.handle('ask-for-mic', async (): Promise<MediaAccessStatus> => {
    await systemPreferences.askForMediaAccess('microphone');
    return systemPreferences.getMediaAccessStatus('microphone');
  });
  ipcMain.handle('ask-for-camera', async (): Promise<MediaAccessStatus> => {
    await systemPreferences.askForMediaAccess('camera');
    return systemPreferences.getMediaAccessStatus('camera');
  });

  ipcMain.handle('ask-for-screen', async () => {
    // await systemPreferences.askForMediaAccess('screen');
    const sources = await desktopCapturer.getSources({ types: ['screen'] });
    log.info(
      'has screen access',
      systemPreferences.getMediaAccessStatus('screen')
    );
    const videoOptionsMenu = Menu.buildFromTemplate(
      sources.map((source) => {
        return {
          label: source.name,
          icon: source.thumbnail,
          click: () =>
            mainWindow.webContents.send('set-screenshare-source', source),
        };
      })
    );

    videoOptionsMenu.popup();
    // desktopCapturer
    //   .getSources({ types: ['window', 'screen'] })
    //   .then(async (sources) => {
    //     log.info('sources', sources);
    //     mainWindow.webContents.send('set-screenshare-source', 'screen:1:0');

    //     for (const source of sources) {
    //       if (source.name === 'Electron') {
    //         mainWindow.webContents.send('set-screenshare-source', 'screen:1:0');
    //         return;
    //       }
    //     }
    //   });
  });

  ipcMain.handle('get-media-status', (_event): MediaAccess => {
    if (!isMac && !isWindows) {
      return {
        camera: 'unknown',
        mic: 'unknown',
        screen: 'unknown',
      };
    }

    const camera = systemPreferences.getMediaAccessStatus('camera');
    const mic = systemPreferences.getMediaAccessStatus('microphone');
    const screen = systemPreferences.getMediaAccessStatus('screen');

    return {
      camera,
      mic,
      screen,
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
