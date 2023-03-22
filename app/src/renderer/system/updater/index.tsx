import { ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import { ProgressInfo, UpdateInfo } from 'electron-updater';
import { Flex, ProgressBar, Button, Text } from '@holium/design-system';
import { HoliumLogo } from './holium-logo';
import { StandAloneMouse } from '../mouse/StandAloneMouse';
import './installer.css';

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

type Props = {
  id: string;
  children?: ReactNode;
};

const View = ({ id, children }: Props) => (
  <Flex
    id={id}
    flexDirection="column"
    position="relative"
    height="100vh"
    width="100%"
    style={{ overflowY: 'hidden' }}
  >
    <StandAloneMouse containerId={id} />
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
      top={172}
      flexDirection="column"
      alignItems="center"
      width="100%"
    >
      {children ?? (
        <Text.Custom pt={34} fontWeight={300} opacity={0.5}>
          Checking for updates...
        </Text.Custom>
      )}
    </Flex>
  </Flex>
);

const container = document.getElementById('root');
const root = createRoot(container as HTMLElement);
const containerId = 'splash-view';
root.render(<View id={containerId} />);

const UpdateAvailable = (props: UpdateAvailableProps) => {
  const { info } = props;
  return (
    <Flex width="100%" flexDirection="column" alignItems="center">
      <Flex gap={20} flexDirection="column" width={308} alignItems="center">
        <Flex gap={4}>
          <Text.Custom fontWeight={300} opacity={0.5}>
            Update available -
          </Text.Custom>
          <Text.Custom fontSize={2} fontWeight={300} opacity={0.5}>
            v{info.version}
          </Text.Custom>
        </Flex>
        <Flex gap={8} flexDirection="column" alignItems="center" width={120}>
          <Button.Primary
            height={26}
            width="inherit"
            justifyContent="center"
            px="8px"
            onClick={() => window.autoUpdate.downloadUpdates()}
          >
            Download
          </Button.Primary>
          <Button.Secondary
            height={26}
            width="inherit"
            justifyContent="center"
            px="8px"
            onClick={() => window.autoUpdate.cancelUpdates()}
          >
            Cancel
          </Button.Secondary>
        </Flex>
      </Flex>
    </Flex>
  );
};

const UpdateDownloaded = () => {
  return (
    <Flex width="100%" flexDirection="column" alignItems="center">
      <Flex gap={20} flexDirection="column" width={308} alignItems="center">
        <Flex gap={4}>
          <Text.Custom fontWeight={300} opacity={0.5}>
            Updates downloaded
          </Text.Custom>
        </Flex>
        <Flex gap={8} flexDirection="column" alignItems="center" width={120}>
          <Button.Primary
            height={26}
            width="inherit"
            justifyContent="center"
            px="8px"
            onClick={() => window.autoUpdate.installUpdates()}
          >
            Install and Restart
          </Button.Primary>
          <Button.Secondary
            height={26}
            width="inherit"
            justifyContent="center"
            px="8px"
            onClick={() => window.autoUpdate.cancelUpdates()}
          >
            Cancel
          </Button.Secondary>
        </Flex>
      </Flex>
    </Flex>
  );
};

const UpdateNotAvailable = () => {
  return (
    <Flex width="100%" flexDirection="column" alignItems="center">
      <Flex gap={20} flexDirection="column" width={308} alignItems="center">
        <Flex gap={4}>
          <Text.Custom fontWeight={300} opacity={0.5}>
            No updates available
          </Text.Custom>
        </Flex>
        <Flex gap={8} flexDirection="column" alignItems="center" width={120}>
          <Button.Secondary
            height={26}
            width="inherit"
            justifyContent="center"
            px="8px"
            onClick={() => window.autoUpdate.cancelUpdates()}
          >
            Ok
          </Button.Secondary>
        </Flex>
      </Flex>
    </Flex>
  );
};

const AppUpdateError = (props: AppUpdateErrorProps) => {
  const { error } = props;
  return (
    <Flex width="100%" flexDirection="column" alignItems="center">
      <Flex flexDirection="column" width={308} alignItems="center">
        <Text.Custom
          color="intent-alert"
          fontSize={1}
          fontWeight={400}
          opacity={0.5}
          width="inherit"
          height={72}
          style={{ wordBreak: 'break-word', overflowY: 'scroll' }}
        >
          {error}
        </Text.Custom>
        <Text.Anchor
          color="accent"
          fontSize={1}
          variant="hint"
          href="mailto:support@holium.com?subject=BUG:Update error"
        >
          Email support@holium.com
        </Text.Anchor>
      </Flex>
    </Flex>
  );
};

const StartingDownload = (props: StartingDownloadProps) => {
  const { info } = props;
  const releaseChannel = process.env.RELEASE_CHANNEL || 'latest';
  return (
    <Flex
      gap={16}
      pt={16}
      width="100%"
      flexDirection="column"
      alignItems="center"
    >
      <Flex width={308}>
        <ProgressBar percentage={0} progressColor="#F08735" />
      </Flex>
      <Flex justifyContent="space-between" width={308} alignItems="flex-start">
        <Text.Custom fontSize={2} fontWeight={300} opacity={0.5}>
          Downloading update...
        </Text.Custom>
        <Flex flexDirection="column" alignItems="flex-end">
          <Text.Custom fontSize={2} fontWeight={300} opacity={0.5}>
            v{info.version}
          </Text.Custom>
          {releaseChannel === 'alpha' && (
            <Text.Custom fontSize={0} fontWeight={300} opacity={0.5}>
              prerelease
            </Text.Custom>
          )}
        </Flex>
      </Flex>
    </Flex>
  );
};

const UpdateStats = (props: UpdateStatsProps) => {
  const { stats, info } = props;
  const releaseChannel = process.env.RELEASE_CHANNEL || 'latest';

  return (
    <Flex
      gap={16}
      pt={16}
      width="100%"
      flexDirection="column"
      alignItems="center"
    >
      <Flex width={308}>
        <ProgressBar percentage={stats.percent} progressColor="#F08735" />
      </Flex>
      <Flex justifyContent="space-between" width={308} alignItems="flex-start">
        <Text.Custom fontSize={2} fontWeight={300} opacity={0.5}>
          Downloading update...
        </Text.Custom>
        <Flex flexDirection="column" alignItems="flex-end">
          <Text.Custom fontSize={2} fontWeight={300} opacity={0.5}>
            v{info.version}
          </Text.Custom>
          {releaseChannel === 'alpha' && (
            <Text.Custom fontSize={0} fontWeight={300} opacity={0.5}>
              prerelease
            </Text.Custom>
          )}
        </Flex>
      </Flex>
    </Flex>
  );
};

window.autoUpdate.listen((_: any, message: any) => {
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
  const containerId = 'updater-view';
  root.render(<View id={containerId}>{view}</View>);
});
