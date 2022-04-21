import process from 'process';
import { ipcRenderer } from 'electron';

process.title = 'holium.realm';

async function boot() {
  console.log('Booting...');
  try {
    ipcRenderer.on('set-socket', (event, { socketId, mainWindowId }) => {
      console.log('socketId', socketId);
    });
  } catch (e) {
    console.log(e);
  }
}

boot();
