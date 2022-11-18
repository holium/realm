import { FC } from 'react';
import styled from 'styled-components';
import { rgba } from 'polished';
import { observer } from 'mobx-react';
import { Flex, Text, Box, AppTile, Button } from 'renderer/components';
import {
  AppType,
  InstallStatus,
  UrbitAppType,
} from 'os/services/spaces/models/bazaar';
import { ShellActions } from 'renderer/logic/actions/shell';
import { SpacesActions } from 'renderer/logic/actions/spaces';

const AppEmpty = styled(Box)`
  border-radius: 16px;
  border: 2px dotted white;
  transition: 0.2s ease;
  &:hover {
    transition: 0.2s ease;
    background: ${rgba('#FFFFFF', 0.12)};
  }
`;

interface AppPreviewProps {
  app: AppType;
  // isDownloaded?: boolean;
  // ?: string;
}

export const AppPreview: FC<AppPreviewProps> = observer(
  (props: AppPreviewProps) => {
    const { app } = props;
    const info = app.info;
    const length = 60;
    const showDetails = (evt: React.MouseEvent<HTMLButtonElement>) => {
      evt.stopPropagation();
      ShellActions.openDialogWithStringProps('app-detail-dialog', {
        appId: app.id,
      });
      evt.currentTarget.blur();
    };
    const onInstallation = (evt: React.MouseEvent<HTMLButtonElement>) => {
      evt.stopPropagation();
      const appHost = (app as UrbitAppType).host;
      if (!appHost) {
        console.error('No host found for app', app.id);
        return;
      }
      switch (app.installStatus) {
        case InstallStatus.installed:
          SpacesActions.uninstallApp(app.id);
          return;
        case InstallStatus.uninstalled:
          SpacesActions.installApp(appHost, app.id);
          return;
        case InstallStatus.started:
          SpacesActions.uninstallApp(app.id);
          return;
        case InstallStatus.failed:
          SpacesActions.installApp(appHost, app.id);
          return;
        default:
          console.error('Unknown install status', app.installStatus);
      }
    };
    return (
      <Flex flexGrow={0} flexDirection="row" gap={16}>
        <AppTile
          tileSize="lg"
          isAnimated={false}
          app={app}
          onAppClick={(selectedApp: AppType) => {
            ShellActions.openDialogWithStringProps('app-detail-dialog', {
              appId: selectedApp.id,
            });
          }}
        />
        <Flex
          pt="6px"
          pb="6px"
          flexDirection="column"
          justifyContent="space-between"
        >
          <Flex flexDirection="column" mr={24} gap={6}>
            <Text fontWeight={500} fontSize={4}>
              {app?.title}
            </Text>
            <Text fontSize={2} opacity={0.6}>
              {info.length > length ? `${info.substring(0, length)}...` : info}
            </Text>
          </Flex>
          <Flex flexGrow={0} gap={12}>
            {/* {app?.type !== 'urbit' ||
            (app?.type === 'urbit' &&
              app?.installStatus === InstallStatus.installed) ? (
              <Button borderRadius={6} opacity={0.3} variant="primary">
                Installed
              </Button>
            ) : (
              <Button
                variant="primary"
                borderRadius={6}
                onClick={onInstallation}
              >
                Install
              </Button>
            )} */}
            <Button
              variant="minimal"
              fontWeight={400}
              borderRadius={6}
              onClick={showDetails}
            >
              App info
            </Button>
          </Flex>
        </Flex>
      </Flex>
    );
  }
);
