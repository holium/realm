const { ipcRenderer: ipc, remote } = require('electron');
const path = require('path');
const React = require('react');
const ReactDOM = require('react-dom/client');
const { Mouse } = require(path.join(__dirname, '../../.holium/dll/mouse.js'));

window.onload = function () {
  ipc.on('mouse-color', (event, color) => {
    renderMouse(color);
  });
  renderMouse();
};

function renderMouse(color) {
  const body = document.getElementsByTagName('body')[0];
  var currentContainer = document.getElementById('realm-mouse-container');
  if (currentContainer) {
    body.removeChild(currentContainer);
  }
  var mouseContainer = document.createElement('div');
  mouseContainer.setAttribute('id', 'realm-mouse-container');
  body.appendChild(mouseContainer);
  const root = ReactDOM.createRoot(mouseContainer);
  root.render(
    React.createElement(Mouse, {
      animateOut: true,
      cursorColor: color,
    })
  );
}
