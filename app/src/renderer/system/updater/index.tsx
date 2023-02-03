import { createRoot } from 'react-dom/client';
import { ProgressInfo, UpdateInfo } from 'electron-updater';
import { Flex, ProgressBar, Button, Text } from '@holium/design-system';
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
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        height: '100vh',
        width: '100%',
        fontFamily: 'Rubik, system-ui, sans-serif',
      }}
    >
      <Flex
        position="absolute"
        top="80px"
        width="100%"
        style={{
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <HoliumLogo />
      </Flex>
      <div
        style={{
          top: 164,
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
  console.log('UpdateAvailable', info);
  return (
    <>
      <div style={{ padding: '12px' }}>Found updates fuckj</div>
      <div style={{ padding: '12px' }}>{info.version}</div>
      <div style={{ padding: '12px' }}>Would you like to install?</div>
      <div style={{ padding: '12px' }}>
        <Button.Base
          style={{ fontFamily: 'Rubik' }}
          onClick={() => window.autoUpdate.downloadUpdates()}
        >
          Yes
        </Button.Base>
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
  console.log(stats, info);
  return (
    <Flex flexDirection="column" alignItems="center">
      <div style={{ width: 280 }}>
        <ProgressBar percentage={50} progressColor="#F08735" />
      </div>
      <div
        style={{
          width: 280,
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
        }}
      >
        <Text.Custom fontWeight={300} opacity={0.5}>
          Downloading update...
        </Text.Custom>
        <Flex flexDirection="column">
          <Text.Custom>{info.version}</Text.Custom>
          <Text.Custom fontSize={1} opacity={0.5}>
            {info.version}
          </Text.Custom>
        </Flex>
      </div>
      <div style={{ padding: '12px' }}>
        Bytes per second: {stats.bytesPerSecond}
      </div>
      <div style={{ padding: '12px' }}>Transferred: {stats.transferred}</div>
      <div style={{ padding: '12px' }}>Total: {stats.total}</div>
      <div style={{ padding: '12px' }}>Percent: {stats.percent}</div>
    </Flex>
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
    <Flex position="relative">
      <Flex position="absolute" style={{ left: 0, top: 80, width: 280 }}>
        <ProgressBar percentage={50} progressColor="#F08735" />
      </Flex>
      <Flex
        position="absolute"
        style={{
          top: 200,
          width: 280,
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
        }}
      >
        <Text.Custom fontWeight={300} opacity={0.5}>
          Downloading update...
        </Text.Custom>
        <Flex flexDirection="column">
          <Text.Custom>{info.version}</Text.Custom>
          <Text.Custom fontSize={1} opacity={0.5}>
            {info.version}
          </Text.Custom>
        </Flex>
      </Flex>
    </Flex>
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
