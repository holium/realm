const React = require('react');
const Mouse = require('../renderer/system/shell/desktop/components/Mouse');

window.on('dom-ready', () => {
  var mouseContainer = document.createElement('div', {
    id: 'realm-mouse-container',
  });
  console.log('onload');
  var mouse = React.createElement(<Mouse />);
  ReactDOM.render(mouse, document.getElementById('realm-mouse-container'));
  document.body.appendChild(mouseContainer);
});
