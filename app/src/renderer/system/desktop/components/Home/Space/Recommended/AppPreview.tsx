import { FC } from 'react';
import { rgba, darken, desaturate, lighten } from 'polished';
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
import { getAppTileFlags } from 'renderer/logic/lib/app';
import { SpacesActions } from 'renderer/logic/actions/spaces';

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
    const { isInstalling, isInstalled, isSuspended, isUninstalled, isFailed } =
      getAppTileFlags(installStatus);

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
    let status;
    if (isSuspended || isFailed) {
      let statusBadgeColor = theme.currentTheme.mode
        ? darken(0.05, desaturate(1, app.color))
        : lighten(0.1, desaturate(1, app.color));
      if (isFailed) {
        statusBadgeColor = theme.currentTheme.mode
          ? rgba(darken(0.05, '#D0384E'), 0.1)
          : rgba(lighten(0.1, '#D0384E'), 0.1);
      }
      status = (
        <Text
          style={{ pointerEvents: 'none', textTransform: 'uppercase' }}
          padding=".2rem .3rem"
          borderRadius={6}
          backgroundColor={
            (app as UrbitAppType).image && rgba(statusBadgeColor, 0.5)
          }
          fontWeight={500}
          textStyle="capitalize"
          fontSize={'13px'}
          color={isFailed ? '#5e0b18' : theme.currentTheme.textColor}
        >
          {app.installStatus}
        </Text>
      );
    }
    return (
      <Flex flexGrow="0" flexDirection="row" gap={16}>
        <AppTile
          tileSize="lg"
          highlightOnHover
          isAnimated={false}
          app={app}
          installStatus={InstallStatus.installed}
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
            <Flex flexDirection="row" gap={16} alignItems="center">
              <Text fontWeight={500} fontSize={4}>
                {app?.title}
              </Text>
              {status}
              {/* {isSuspended && (
                <Text
                  style={{ pointerEvents: 'none', textTransform: 'uppercase' }}
                  padding=".3rem .4rem"
                  borderRadius={6}
                  backgroundColor={rgba(theme.currentTheme.dockColor, 0.5)}
                  fontWeight={500}
                  textStyle="capitalize"
                  fontSize={1}
                  color={rgba(theme.currentTheme.textColor, 0.9)}
                >
                  Suspended
                </Text>
              )} */}

              {/* {isSuspended && (
                <Text
                  style={{ pointerEvents: 'none', textTransform: 'uppercase' }}
                  padding=".3rem .4rem"
                  borderRadius={6}
                  backgroundColor={rgba(theme.currentTheme.dockColor, 0.5)}
                  fontWeight={500}
                  textStyle="capitalize"
                  fontSize={1}
                  color={rgba(theme.currentTheme.textColor, 0.9)}
                >
                  Suspended
                </Text>
              )} */}
            </Flex>

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
            {isFailed && (
              <Button
                pt="2px"
                pb="2px"
                variant="minimal"
                fontWeight={400}
                borderRadius={6}
                color={'#FFF'}
                disabled={true}
                backgroundColor={theme.currentTheme.accentColor}
                onClick={() => {
                  const appHost = (app as UrbitAppType).host;
                  SpacesActions.installApp(appHost!, app.id);
                }}
              >
                Retry install
              </Button>
            )}
            {isSuspended && (
              <Button
                pt="2px"
                pb="2px"
                variant="minimal"
                fontWeight={400}
                borderRadius={6}
                color={'#FFF'}
                backgroundColor={theme.currentTheme.accentColor}
                onClick={() => {
                  SpacesActions.reviveApp(app.id);
                }}
              >
                Revive
              </Button>
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
