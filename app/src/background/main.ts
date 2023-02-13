import process from 'process';
import { ipcRenderer } from 'electron';

process.title = 'holium.realm';

async function boot() {
  console.log('Booting...');
  try {
    ipcRenderer.on('set-socket', (_, { socketId }) => {
      console.log('socketId', socketId);
    });
  } catch (e) {
    console.log(e);
  }
}

boot();
