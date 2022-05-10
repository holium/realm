const Mouse = require('../renderer/system/shell/desktop/components/Mouse');

window.on('dom-ready', () => {
  console.log('dom-ready');
  // In embedder page. (parent Renderer / browser.js)
  // const webview = document.querySelector('webview');
  // webview.addEventListener('ipc-message', (event) => {
  //   console.log(event.channel);
  //   // Prints "pong"
  // });
  // webview.send('ping');

  // // In guest page. (preload script for the webview / inject.js)
  // const { ipcRenderer } = require('electron');
  // ipcRenderer.on('ping', () => {
  //   ipcRenderer.sendToHost('pong');
  // });
  var mouseContainer = document.createElement('div', {
    id: 'realm-mouse-container',
  });

  console.log('onload');
  var mouse = React.createElement(<Mouse />);
  ReactDOM.render(mouse, document.getElementById('realm-mouse-container'));
  document.body.appendChild(mouseContainer);
});
