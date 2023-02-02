import { createRoot } from 'react-dom/client';
import { ProgressInfo } from 'electron-updater';

const environment = process.env.NODE_ENV;
const isProd = environment === 'production';

declare global {
  var autoUpdate: any;
}

type UpdateStatsProps = {
  stats: ProgressInfo;
};

const View = (props: any) => {
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

const UpdateStats = (props: UpdateStatsProps) => {
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

const UpdateDownloaded = () => {
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

const UpdateNotAvailable = () => {
  return (
    <>
      <div style={{ padding: '12px' }}>No updates available</div>
      <div style={{ padding: '12px' }}>
        <button
          style={{ marginLeft: '8px', fontFamily: 'Rubik' }}
          onClick={() => window.autoUpdate.cancelUpdates()}
        >
          Ok
        </button>
      </div>
    </>
  );
};

const AppUpdateError = (props) => {
  return (
    <>
      <div style={{ padding: '12px' }}>{props.error}</div>
      <div style={{ padding: '12px' }}>
        <button
          style={{ marginLeft: '8px', fontFamily: 'Rubik' }}
          onClick={() => window.autoUpdate.cancelUpdates()}
        >
          Ok
        </button>
      </div>
    </>
  );
};

// @ts-ignore
window.autoUpdate.listen((event, message: any) => {
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
    case 'checking-for-updates':
      view = () => <>Checking for updates. Please wait...</>;
      break;
    case 'update-not-available':
      view = <UpdateNotAvailable />;
      break;
    case 'error':
      view = <AppUpdateError error={message.error} />;
      break;
  }
  root.render(<View>{view}</View>);
});
