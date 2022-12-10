import { BrowserWindow, ipcMain, systemPreferences } from 'electron';

export const registerListeners = (mainWindow: BrowserWindow) => {
  ipcMain.handle('ask-for-mic', async (_event) => {
    console.log(
      'microphone access:',
      systemPreferences.getMediaAccessStatus('microphone')
    );

    await systemPreferences.askForMediaAccess('microphone');
    return systemPreferences.getMediaAccessStatus('microphone');
  });
  ipcMain.handle('ask-for-camera', async (_event) => {
    console.log(
      'camera access:',
      systemPreferences.getMediaAccessStatus('camera')
    );

    await systemPreferences.askForMediaAccess('camera');
    return systemPreferences.getMediaAccessStatus('camera');
  });

  ipcMain.handle('get-media-status', async (_event) => {
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

export default { registerListeners };
