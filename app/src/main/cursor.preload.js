const { app, ipcRenderer, contextBridge } = require('electron');
const path = require('path');
let CursorLib;
if (__dirname.includes('app.asar')) {
  CursorLib = require(path.resolve(__dirname, './cursor.js'));
} else {
  CursorLib = require(path.join(__dirname, '../../.holium/dll/cursor.js'));
}
const { React, ReactDOM, Presences, Mouse } = CursorLib;

// Load current ship into preload context and webview contents context
ipcRenderer.on('load-ship', (e, shipString) => {
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
ipcRenderer.on('load-window-id', (e, windowId) => {
  globalThis.id = windowId;
  contextBridge.exposeInMainWorld('id', windowId);
});

window.onload = function () {
  ipcRenderer.on('mouse-color', (event, color, initialRender) => {
    renderMouse(color);
  });
  renderMouse();
  renderPresences();
};

function renderMouse(color) {
  const container = createContainer('realm-mouse-container');
  container.style.overflow = 'hidden';
  // container.style.overflowX = 'hidden';
  // container.style.overflowY = 'hidden';
  // container.style.width = 'inherit';
  // container.style.height = 'inherit';
  // container.style.position = 'absolute';
  // container.style.left = 0;
  // container.style.right = 0;
  // container.style.top = 0;
  // container.style.bottom = 0;
  // container.style.zIndex = 2147483646;
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
