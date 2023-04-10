const { ipcRenderer: ipc } = require('electron');

document.addEventListener('DOMContentLoaded', () => {
  ipc.sendToHost({
    height: document.querySelector('article').offsetHeight,
  });
});
