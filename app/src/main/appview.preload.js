const { ipcRenderer: ipc, remote, contextBridge } = require('electron');
const path = require('path');
const React = require('react');
const ReactDOM = require('react-dom/client');
const { Presences, Mouse } = require(path.join(
  __dirname,
  '../../.holium/dll/mouse.js'
));

// Load current ship into preload context and webview contents context
ipc.on('load-ship', (e, shipString) => {
  try {
    const ship = JSON.parse(shipString);
    // webview preload (this file and its imports)
    globalThis.ship = ship;
    // webview contents
    contextBridge.exposeInMainWorld('ship', ship);
  } catch (e) {
    console.error('Error parsing ship', e);
  }
});
ipc.on('load-window-id', (e, windowId) => {
  globalThis.id = windowId;
  contextBridge.exposeInMainWorld('id', windowId);
});

window.onload = function () {
  ipc.on('mouse-color', (event, color) => {
    renderMouse(color);
  });
  renderMouse();
  renderPresences();
};

function renderMouse(color) {
  const container = createContainer('realm-mouse-container');
  const root = ReactDOM.createRoot(container);
  root.render(
    React.createElement(Mouse, {
      animateOut: true,
      cursorColor: color,
    })
  );
}

function renderPresences() {
  const container = createContainer('realm-presence-container');
  const root = ReactDOM.createRoot(container);
  root.render(React.createElement(Presences));
}

function createContainer(id) {
  const body = document.getElementsByTagName('body')[0];
  // body.setAttribute('style', 'position: relative;');
  // console.log('rendering mouse');
  const currentContainer = document.getElementById(id);
  if (currentContainer) {
    body.removeChild(currentContainer);
  }
  const container = document.createElement('div');
  container.setAttribute('id', id);
  body.appendChild(container);
  return container;
}
