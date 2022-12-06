import { FC } from 'react';
import { rgba } from 'polished';
import { toJS } from 'mobx';
import { observer } from 'mobx-react';
import {
  Flex,
  Text,
  AppTile,
  Icons,
  IconButton,
  Button,
  Spinner,
} from 'renderer/components';
import {
  AppType,
  InstallStatus,
  UrbitAppType,
} from 'os/services/spaces/models/bazaar';
import { ShellActions } from 'renderer/logic/actions/shell';
import { useServices } from 'renderer/logic/store';
import { DesktopActions } from 'renderer/logic/actions/desktop';
import { handleInstallation } from '../../AppInstall/helpers';

interface AppPreviewProps {
  app: AppType;
}

export const AppPreview: FC<AppPreviewProps> = observer(
  (props: AppPreviewProps) => {
    const { app } = props;
    const { theme, spaces } = useServices();
    const space = spaces.selected;
    let installStatus = InstallStatus.uninstalled;
    let info = '';
    if (app.type === 'urbit') {
      info = app.info;
      installStatus = app.installStatus as InstallStatus;
    }
    const isUninstalled = installStatus === InstallStatus.uninstalled;
    const isInstalled = installStatus === InstallStatus.installed;
    const isInstalling =
      installStatus !== InstallStatus.installed && !isUninstalled;

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
      return handleInstallation(appHost, app.id, installStatus);
    };
    return (
      <Flex flexGrow={0} flexDirection="row" gap={16}>
        <AppTile
          tileSize="lg"
          highlightOnHover
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
            {isUninstalled && (
              <IconButton
                size={26}
                color={theme.currentTheme.accentColor}
                customBg={rgba(theme.currentTheme.dockColor, 0.5)}
                hoverFill={theme.currentTheme.accentColor}
                onClick={onInstallation}
              >
                <Icons name="CloudDownload" />
              </IconButton>
            )}
            {isInstalling && (
              <Flex
                height={26}
                width={26}
                alignItems="center"
                justifyContent="center"
              >
                <Spinner size={0} />
              </Flex>
            )}
            {isInstalled && (
              <Button
                pt="2px"
                pb="2px"
                variant="minimal"
                fontWeight={400}
                borderRadius={6}
                color={rgba(theme.currentTheme.textColor, 0.9)}
                backgroundColor={rgba(theme.currentTheme.dockColor, 0.5)}
                onClick={(evt) => {
                  DesktopActions.openAppWindow(space!.path, toJS(app));
                  DesktopActions.setHomePane(false);
                }}
              >
                Open
              </Button>
            )}
            {/* TODO add menu on click  */}
            <IconButton
              size={26}
              customBg={rgba(theme.currentTheme.dockColor, 0.5)}
            >
              <Icons name="MoreHorizontal" />
            </IconButton>
          </Flex>
        </Flex>
      </Flex>
    );
  }
);
