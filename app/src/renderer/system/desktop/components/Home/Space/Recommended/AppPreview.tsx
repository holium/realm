import { FC } from 'react';
import { toJS } from 'mobx';
import { observer } from 'mobx-react';

import { Button, Flex, Icon, Spinner, Text } from '@holium/design-system';

import { AppTile } from 'renderer/components';
import { getAppTileFlags } from 'renderer/lib/app';
import { useAppState } from 'renderer/stores/app.store';
import {
  AppMobxType,
  AppType,
  InstallStatus,
} from 'renderer/stores/models/bazaar.model';
import { useShipStore } from 'renderer/stores/ship.store';

import { handleInstallation } from '../../AppInstall/helpers';

interface AppPreviewProps {
  app: AppType;
}

export const AppPreview: FC<AppPreviewProps> = observer(
  (props: AppPreviewProps) => {
    const { app } = props;
    const { shellStore } = useAppState();
    const { spacesStore, bazaarStore } = useShipStore();
    const space = spacesStore.selected;
    let installStatus = InstallStatus.installed;
    let info = '';
    if (app.type === 'urbit') {
      info = app.info;
      installStatus = bazaarStore.catalog.get(app.id)
        ?.installStatus as InstallStatus;
    }

    const {
      isInstalling,
      isInstalled,
      isSuspended,
      isUninstalled,
      isFailed,
      isDesktop,
    } = getAppTileFlags(installStatus);

    const length = 60;

    const onInstallation = (evt: React.MouseEvent<HTMLButtonElement>) => {
      evt.stopPropagation();
      const appHost = (app as AppMobxType).host;
      return handleInstallation(appHost, app.id, installStatus);
    };
    let status;
    if (isSuspended || isFailed) {
      // let statusBadgeColor = theme.currentTheme.mode
      //   ? darken(0.05, desaturate(1, app.color))
      //   : lighten(0.1, desaturate(1, app.color));
      // if (isFailed) {
      //   statusBadgeColor = theme.currentTheme.mode
      //     ? rgba(darken(0.05, '#D0384E'), 0.1)
      //     : rgba(lighten(0.1, '#D0384E'), 0.1);
      // }
      status = (
        <Text.Custom
          style={{ pointerEvents: 'none', textTransform: 'uppercase' }}
          padding=".2rem .3rem"
          borderRadius={6}
          // backgroundColor={
          //   (app as UrbitAppType).image && rgba(statusBadgeColor, 0.5)
          // }
          fontWeight={500}
          textStyle="capitalize"
          fontSize={'13px'}
          // color={isFailed ? '#5e0b18' : theme.currentTheme.textColor}
        >
          {installStatus}
        </Text.Custom>
      );
    }
    return (
      <Flex flexGrow="0" flexDirection="row" gap={16}>
        <AppTile
          tileId={`preview-${app.id}`}
          tileSize="lg"
          highlightOnHover
          isAnimated={false}
          app={app}
          installStatus={InstallStatus.installed}
          onAppClick={(selectedApp: AppType) => {
            if (!(isInstalling || isInstalled)) {
              shellStore.openDialogWithStringProps('app-detail-dialog', {
                appId: selectedApp.id,
              });
            }
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
              <Text.Custom fontWeight={500} fontSize={4}>
                {app?.title}
              </Text.Custom>
              {status}
            </Flex>

            <Text.Custom fontSize={2} opacity={0.6}>
              {info.length > length ? `${info.substring(0, length)}...` : info}
            </Text.Custom>
          </Flex>
          <Flex flexGrow={0} gap={12}>
            {(isUninstalled || isDesktop) && (
              <Button.IconButton
                size={26}
                // color={theme.currentTheme.accentColor}
                // customBg={rgba(theme.currentTheme.dockColor, 0.5)}
                // hoverFill={theme.currentTheme.accentColor}
                onClick={onInstallation}
              >
                <Icon name="CloudDownload" size={20} />
              </Button.IconButton>
            )}
            {isInstalling && (
              <Flex
                height={26}
                width={26}
                alignItems="center"
                justifyContent="center"
              >
                <Spinner size={0} color={'white'} />
              </Flex>
            )}
            {isFailed && (
              <Button.Secondary
                pt="2px"
                pb="2px"
                variant="minimal"
                fontWeight={400}
                borderRadius={6}
                // color={rgba(theme.currentTheme.textColor, 0.9)}
                // backgroundColor={rgba(theme.currentTheme.dockColor, 0.5)}
                onClick={() => {
                  bazaarStore.uninstallApp(app.id);
                }}
              >
                Uninstall
              </Button.Secondary>
            )}
            {isSuspended && (
              <Button.Primary
                pt="2px"
                pb="2px"
                variant="minimal"
                fontWeight={400}
                borderRadius={6}
                // color={'#FFF'}
                // backgroundColor={theme.currentTheme.accentColor}
                onClick={() => {
                  bazaarStore.reviveApp(app.id);
                }}
              >
                Revive
              </Button.Primary>
            )}
            {isInstalled && (
              <Button.Secondary
                pt="2px"
                pb="2px"
                variant="minimal"
                fontWeight={400}
                borderRadius={6}
                // color={rgba(theme.currentTheme.textColor, 0.9)}
                // backgroundColor={rgba(theme.currentTheme.dockColor, 0.5)}
                onClick={() => {
                  space && shellStore.openWindow(toJS(app));
                  shellStore.closeHomePane();
                }}
              >
                Open
              </Button.Secondary>
            )}
            {/* TODO add menu on click  */}
            {/* <IconButton
              size={26}
              customBg={rgba(theme.currentTheme.dockColor, 0.5)}
            >
              <Icons name="MoreHorizontal" />
            </IconButton> */}
          </Flex>
        </Flex>
      </Flex>
    );
  }
);
