/**
 * This file is loaded via the <script> tag in the index.html file and will
 * be executed in the renderer process for that window. No Node.js APIs are
 * available in this process because `nodeIntegration` is turned off and
 * `contextIsolation` is turned on. Use the contextBridge API in `preload.js`
 * to expose Node.js functionality from the main process.
 */
console.log('hi from view-renderer');

const check = document.getElementById('checking-for-update');
const avail = document.getElementById('update-available');
const stats = document.getElementById('stats');

window.autoUpdate.listen((event, message) => {
  console.log('message => %o', message);
  switch (message.name) {
    case 'update-available':
      check.style.display = 'none';
      avail.style.display = 'flex';
      break;

    case 'update-status':
      avail.style.display = 'none';
      stats.style.display = 'flex';
      const speed = document.getElementById('speed');
      speed.innerText = message.data.speed;
      const percent = document.getElementById('percent');
      percent.innerText = message.data.percent;
      const transferred = document.getElementById('transferred');
      transferred.innerText = message.data.transferred;
      const total = document.getElementById('total');
      total.innerText = message.data.total;
      break;
  }
});

const install = document.getElementById('install-updates');
install.addEventListener('click', () => {
  window.autoUpdate.installUpdates();
});

const cancel = document.getElementById('cancel-updates');
cancel.addEventListener('click', () => {
  window.autoUpdate.cancelUpdates();
});
