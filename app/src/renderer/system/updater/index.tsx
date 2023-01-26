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
    <>Checking for updates. Please wait...</>
  </View>
);

const UpdateAvailable = () => {
  return (
    <>
      <div style={{ padding: '12px' }}>Found updates</div>
      <div style={{ padding: '12px' }}>Would you like to install?</div>
      <div style={{ padding: '12px' }}>
        <button
          style={{ fontFamily: 'Rubik' }}
          onClick={() => window.autoUpdate.downloadUpdates()}
        >
          Yes
        </button>
        <button
          style={{ marginLeft: '8px', fontFamily: 'Rubik' }}
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
      <div style={{ padding: '12px' }}>
        Bytes per second: {stats.bytesPerSecond}
      </div>
      <div style={{ padding: '12px' }}>Transferred: {stats.transferred}</div>
      <div style={{ padding: '12px' }}>Total: {stats.total}</div>
      <div style={{ padding: '12px' }}>Percent: {stats.percent}</div>
    </>
  );
};

const UpdateDownloaded = (props) => {
  return (
    <>
      <div style={{ padding: '12px' }}>Updates downloaded</div>
      <div style={{ padding: '12px' }}>
        <button
          style={{ fontFamily: 'Rubik' }}
          onClick={() => window.autoUpdate.installUpdates()}
        >
          Install
        </button>
        <button
          style={{ marginLeft: '8px', fontFamily: 'Rubik' }}
          onClick={() => window.autoUpdate.cancelUpdates()}
        >
          Cancel
        </button>
      </div>
    </>
  );
};

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
});
