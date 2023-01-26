import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
// import { Button } from '@holium/design-system';

const environment = process.env.NODE_ENV;
const isProd = environment === 'production';

const View = (props) => {
  return (
    <div
      style={{
        display: 'flex',
        flex: 1,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
      }}
    >
      {props.children}
    </div>
  );
};

const container = document.getElementById('root')!;
const root = createRoot(container);
root.render(
  <View>
    <>Initializing. Please wait...</>
  </View>
);

const UpdateAvailable = () => {
  return (
    <>
      <div style={{ padding: '12px' }}>Found updates</div>
      <div style={{ padding: '12px' }}>Would you like to install?</div>
      <div style={{ padding: '12px' }}>
        <button onClick={() => window.autoUpdate.downloadUpdates()}>Yes</button>
        <button
          style={{ marginLeft: '8px' }}
          onClick={() => window.autoUpdate.cancelUpdates()}
        >
          No
        </button>
      </div>
    </>
  );
};

const UpdateStats = (props) => {
  const { stats } = props;
  return (
    <>
      <div>Bytes per second: {stats.bytesPerSecond}</div>
      <div>Transferred: {stats.transferred}</div>
      <div>Total: {stats.total}</div>
      <div>Percent: {stats.percent}</div>
    </>
  );
};

const UpdateDownloaded = (props) => {
  const { stats } = props;
  return (
    <>
      <div>Updates downloaded</div>
      <button onClick={() => window.autoUpdate.installUpdates()}>
        Install
      </button>
    </>
  );
};

// /**
//  * This file is loaded via the <script> tag in the index.html file and will
//  * be executed in the renderer process for that window. No Node.js APIs are
//  * available in this process because `nodeIntegration` is turned off and
//  * `contextIsolation` is turned on. Use the contextBridge API in `preload.js`
//  * to expose Node.js functionality from the main process.
//  */
// console.log('hi from view-renderer');

// const check = document.getElementById('checking-for-update');
// const avail = document.getElementById('update-available');
// const stats = document.getElementById('stats');

window.autoUpdate.listen((event, message) => {
  console.log('message => %o', message);
  let view = undefined;
  switch (message.name) {
    case 'update-available':
      view = <UpdateAvailable />;
      break;
    case 'update-status':
      view = <UpdateStats stats={message} />;
      break;
    case 'update-downloaded':
      view = <UpdateDownloaded />;
      break;
    case 'starting-download':
      view = () => <>Starting download. Please wait...</>;
      break;
  }
  root.render(<View>{view}</View>);
  // switch (message.name) {
  //   case 'update-available':
  //     check.style.display = 'none';
  //     avail.style.display = 'flex';
  //     break;

  //   case 'update-status':
  //     avail.style.display = 'none';
  //     stats.style.display = 'flex';
  //     const speed = document.getElementById('speed');
  //     speed.innerText = message.data.speed;
  //     const percent = document.getElementById('percent');
  //     percent.innerText = message.data.percent;
  //     const transferred = document.getElementById('transferred');
  //     transferred.innerText = message.data.transferred;
  //     const total = document.getElementById('total');
  //     total.innerText = message.data.total;
  //     break;
  // }
});

// const install = document.getElementById('install-updates');
// install.addEventListener('click', () => {
//   window.autoUpdate.installUpdates();
// });

// const cancel = document.getElementById('cancel-updates');
// cancel.addEventListener('click', () => {
//   window.autoUpdate.cancelUpdates();
// });
