import ipc from 'node-ipc';

ipc.config.silent = true;

/**
 *
 * @param processName realm.~lomder-librun
 * @returns
 */
function isSocketTaken(processName: string) {
  return new Promise((resolve, reject) => {
    ipc.connectTo(processName, () => {
      ipc.of[processName].on('error', () => {
        ipc.disconnect(processName);
        reject(false);
      });

      ipc.of[processName].on('connect', () => {
        ipc.disconnect(processName);
        resolve(true);
      });
    });
  });
}

export async function findOpenSocket() {
  let currentSocket = 1;
  console.log('checking', currentSocket);
  while (await isSocketTaken('communityos' + currentSocket)) {
    currentSocket++;
    console.log('checking', currentSocket);
  }
  console.log('found socket', currentSocket);
  return 'communityos' + currentSocket;
}
