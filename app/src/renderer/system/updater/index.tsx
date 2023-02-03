import { createRoot } from 'react-dom/client';
import { ProgressInfo, UpdateInfo } from 'electron-updater';
import { Flex, ProgressBar, Button, Text } from '@holium/design-system';
import { HoliumLogo } from './holium-logo';
import { InstallerStyle } from './installer.styles';

const environment = process.env.NODE_ENV;
const isProd = environment === 'production';

declare global {
  var autoUpdate: any;
}

type UpdateStatsProps = {
  stats: ProgressInfo;
  info: UpdateInfo & { channel: string | null };
};

type UpdateAvailableProps = {
  info: UpdateInfo;
};

type StartingDownloadProps = {
  info: UpdateInfo & { channel: string | null };
};

type AppUpdateErrorProps = {
  error: string;
};

const View = (props: any) => {
  return (
    <>
      <InstallerStyle />
      <Flex
        flexDirection="column"
        position="relative"
        height="100vh"
        width="100%"
      >
        <Flex
          position="absolute"
          top={58}
          width="100%"
          style={{
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <HoliumLogo />
        </Flex>
        <Flex
          position="absolute"
          gap={16}
          top={190}
          flexDirection="column"
          alignItems="center"
          width="100%"
        >
          {props.children || (
            <Text.Custom pt={16} fontWeight={300} opacity={0.5}>
              Checking for updates...
            </Text.Custom>
          )}
        </Flex>
      </Flex>
    </>
  );
};

const container = document.getElementById('root')!;
const root = createRoot(container);
root.render(<View />);

const UpdateAvailable = (props: UpdateAvailableProps) => {
  const { info } = props;
  return (
    <Flex width="100%" flexDirection="column" alignItems="center">
      <Flex
        gap={20}
        flexDirection="column"
        justifyContent="space-between"
        width={308}
        alignItems="center"
      >
        {/* <Text.Custom fontWeight={300} opacity={0.5}>
          Install update v{info.version}
        </Text.Custom> */}
        <Flex gap={4}>
          <Text.Custom fontWeight={300} opacity={0.5}>
            Update available -
          </Text.Custom>
          <Text.Custom fontSize={2} fontWeight={300} opacity={0.5}>
            v{info.version}
          </Text.Custom>
        </Flex>
        <Flex gap={16}>
          <Button.Transparent
            height={26}
            px="8px"
            onClick={() => window.autoUpdate.cancelUpdates()}
          >
            Cancel
          </Button.Transparent>
          <Button.TextButton
            height={26}
            px="8px"
            onClick={() => window.autoUpdate.downloadUpdates()}
          >
            Download
          </Button.TextButton>
        </Flex>
      </Flex>
    </Flex>
  );
};

const UpdateStats = (props: UpdateStatsProps) => {
  const { stats, info } = props;
  return (
    <Flex gap={16} width="100%" flexDirection="column" alignItems="center">
      <Flex width={308}>
        <ProgressBar percentage={stats.percent} progressColor="#F08735" />
      </Flex>
      <Flex justifyContent="space-between" width={308} alignItems="flex-start">
        <Text.Custom fontSize={2} fontWeight={300} opacity={0.5}>
          Downloading update...
        </Text.Custom>
        <Flex flexDirection="column" alignItems="flex-end">
          <Text.Custom fontSize={2}>v{info.version}</Text.Custom>
          {info.channel && (
            <Text.Custom fontSize={0} fontWeight={300} opacity={0.5}>
              {info.channel}
            </Text.Custom>
          )}
        </Flex>
      </Flex>
    </Flex>
  );
};

const UpdateDownloaded = () => {
  return (
    <Flex>
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
    </Flex>
  );
};

const UpdateNotAvailable = () => {
  return (
    <Flex>
      <div style={{ padding: '12px' }}>No updates available</div>
      <div style={{ padding: '12px' }}>
        <button
          style={{ marginLeft: '8px', fontFamily: 'Rubik' }}
          onClick={() => window.autoUpdate.cancelUpdates()}
        >
          Ok
        </button>
      </div>
    </Flex>
  );
};

const AppUpdateError = (props: AppUpdateErrorProps) => {
  const { error } = props;
  return <div style={{ padding: '12px' }}>{error}</div>;
};

const StartingDownload = (props: StartingDownloadProps) => {
  const { info } = props;
  return (
    <Flex gap={16} width="100%" flexDirection="column" alignItems="center">
      <Flex width={308}>
        <ProgressBar percentage={0} progressColor="#F08735" />
      </Flex>
      <Flex justifyContent="space-between" width={308} alignItems="flex-start">
        <Text.Custom fontSize={2} fontWeight={300} opacity={0.5}>
          Downloading update...
        </Text.Custom>
        <Flex flexDirection="column" alignItems="flex-end">
          <Text.Custom fontSize={2}>v{info.version}</Text.Custom>
          {info.channel && (
            <Text.Custom fontSize={0} fontWeight={300} opacity={0.5}>
              {info.channel}
            </Text.Custom>
          )}
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
    // case 'checking-for-updates':
    //   view = <>Checking for updates. Please wait...</>;
    //   break;
    case 'update-not-available':
      view = <UpdateNotAvailable />;
      break;
    case 'error':
      view = <AppUpdateError error={message.error} />;
      break;
  }
  root.render(<View>{view}</View>);
});
