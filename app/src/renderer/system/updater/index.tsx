import { createRoot } from 'react-dom/client';
import { ProgressInfo, UpdateInfo } from 'electron-updater';
import { HoliumLogo } from './holium-logo';

const environment = process.env.NODE_ENV;
const isProd = environment === 'production';

declare global {
  var autoUpdate: any;
}

type UpdateStatsProps = {
  stats: ProgressInfo;
  info: UpdateInfo;
};

type UpdateAvailableProps = {
  info: UpdateInfo;
};

type StartingDownloadProps = {
  info: UpdateInfo;
};

type AppUpdateErrorProps = {
  error: string;
};

const View = (props: any) => {
  return (
    <div
      style={{
        height: '100vh',
        width: '100%',
        fontFamily: 'Rubik, system-ui, sans-serif',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <HoliumLogo />

      <div
        style={{
          display: 'flex',
          flex: 1,
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
        }}
      >
        {props.children}
      </div>
    </div>
  );
};

const container = document.getElementById('root')!;
const root = createRoot(container);
root.render(<View />);

const UpdateAvailable = (props: UpdateAvailableProps) => {
  const { info } = props;
  return (
    <>
      <div style={{ padding: '12px' }}>Found updates</div>
      <div style={{ padding: '12px' }}>{info.version}</div>
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
  const { stats, info } = props;
  return (
    <>
      <div style={{ padding: '12px' }}>Version: {info.version}</div>
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

const AppUpdateError = (props: AppUpdateErrorProps) => {
  const { error } = props;
  return (
    <>
      <div style={{ padding: '12px' }}>{error}</div>
    </>
  );
};

const StartingDownload = (props: StartingDownloadProps) => {
  const { info } = props;
  return (
    <>
      <div style={{ padding: '12px' }}>Downloading {info.version}...</div>
    </>
  );
};

// @ts-ignore
window.autoUpdate.listen((event, message: any) => {
  console.log('message => %o', message);
  let view = undefined;
  switch (message.name) {
    case 'update-available':
      view = <UpdateAvailable info={message} />;
      break;
    case 'update-status':
      view = <UpdateStats {...message} />;
      break;
    case 'update-downloaded':
      view = <UpdateDownloaded />;
      break;
    case 'starting-download':
      view = <StartingDownload info={message} />;
      break;
    case 'checking-for-updates':
      view = <>Checking for updates. Please wait...</>;
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
