import React, { FC } from 'react';
import styled, { css } from 'styled-components';
import { rgba } from 'polished';

import { Box, AppTile, Icons, BoxProps, IconButton } from 'renderer/components';
import { SpaceModelType } from 'os/services/spaces/models/spaces';
import {
  AppType,
  InstallStatus,
  UrbitAppType,
} from 'os/services/spaces/models/bazaar';
import { DesktopActions } from 'renderer/logic/actions/desktop';
import { SpacesActions } from 'renderer/logic/actions/spaces';
import { observer } from 'mobx-react';
import { useServices } from 'renderer/logic/store';
import { handleInstallation, installLabel } from '../../AppInstall/helpers';
import { getAppTileFlags } from 'renderer/logic/lib/app';

type AppEmptyProps = {
  isSelected: boolean;
  accentColor: string;
} & BoxProps;

const AppEmpty = styled(Box)<AppEmptyProps>`
  border-radius: 20px;
  /* border: 2px dotted white; */
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  transition: 0.2s ease;
  background: ${rgba('#FBFBFB', 0.4)};
  &:hover {
    transition: 0.2s ease;
    background: ${rgba('#FFFFFF', 0.5)};
  }
  ${(props: AppEmptyProps) =>
    props.isSelected &&
    css`
      border: 2px solid ${props.accentColor};
    `};
`;

interface SuiteAppProps {
  id: string;
  index: number;
  selected: boolean;
  space: SpaceModelType;
  highlightColor?: string;
  accentColor: string;
  app?: AppType;
  isAdmin?: boolean;
  onClick?: (e: React.MouseEvent<any, MouseEvent>, app?: any) => void;
}

export const SuiteApp: FC<SuiteAppProps> = observer((props: SuiteAppProps) => {
  const { id, selected, index, accentColor, app, space, isAdmin, onClick } =
    props;
  const { bazaar } = useServices();

  if (app) {
    const isPinned = bazaar.isPinned(space.path, app.id);
    const weRecommended = bazaar.isRecommended(app.id);
    const installStatus =
      ((app as UrbitAppType).installStatus as InstallStatus) ||
      InstallStatus.installed;
    const { isInstalling, isInstalled, isSuspended, isUninstalled } =
      getAppTileFlags(installStatus);
    // const isUninstalled = app.installStatus === InstallStatus.uninstalled;
    // const isInstalling =
    //   (app as UrbitAppType).installStatus !== InstallStatus.installed &&
    //   !isUninstalled;

    const onInstallation = (evt: React.MouseEvent<HTMLButtonElement>) => {
      evt.stopPropagation();
      const appHost = (app as UrbitAppType).host;
      return handleInstallation(appHost, app.id, installStatus);
    };
    const menu = [];
    if (isAdmin) {
      menu.push({
        label: 'Remove from suite',
        onClick: (evt: any) => {
          evt.stopPropagation();
          SpacesActions.removeFromSuite(space.path, index);
        },
      });
      menu.push({
        label: isPinned ? 'Unpin' : 'Pin',
        onClick: (evt: any) => {
          evt.stopPropagation();
          isPinned
            ? SpacesActions.unpinApp(space.path, app.id)
            : SpacesActions.pinApp(space.path, app.id, null);
        },
      });
    }
    menu.push({
      label: weRecommended ? 'Unrecommend app' : 'Recommend app',
      onClick: (evt: any) => {
        evt.stopPropagation();
        weRecommended
          ? SpacesActions.unrecommendApp(app.id)
          : SpacesActions.recommendApp(app.id);
      },
    });
    if (app.type === 'urbit') {
      menu.push({
        label: installLabel(app.installStatus as InstallStatus),
        disabled: false,
        section: 2,
        onClick: (evt: any) => {
          evt.stopPropagation();
          // console.log('install app => %o', app);
          if (!app.host) throw new Error('App host is undefined');
          return handleInstallation(
            app.host,
            app.id,
            app.installStatus as InstallStatus
          );
          // if (app.installStatus === InstallStatus.installed) {
          //   SpacesActions.uninstallApp(app.id);
          // } else if (app.installStatus === InstallStatus.suspended) {
          //   console.log('resume app => %o', app);
          // } else {
          //   console.log(app);
          //   if (app.host) {
          //     SpacesActions.installApp(app.host, app.id);
          //   }
          // }
        },
      });
    }

    return (
      <Box position="relative">
        {isUninstalled && (
          <Box zIndex={6} position="absolute" right="14px" top="14px">
            <IconButton size={26} color={accentColor} onClick={onInstallation}>
              <Icons name="CloudDownload" />
            </IconButton>
          </Box>
        )}
        <AppTile
          tileSize="xl1"
          app={app}
          isAnimated={isInstalled}
          isUninstalled={isUninstalled}
          installStatus={installStatus}
          isPinned={isPinned}
          isRecommended={weRecommended}
          allowContextMenu={true}
          contextMenu={menu}
          onAppClick={(selectedApp: AppType) => {
            DesktopActions.openAppWindow(space.path, selectedApp);
            DesktopActions.setHomePane(false);
          }}
        />
      </Box>
    );
  }
  return (
    <AppEmpty
      id={id}
      height={160}
      width={160}
      isSelected={selected}
      accentColor={accentColor}
      onClick={(e) => onClick && onClick(e, undefined)}
    >
      <Icons size={24} name="Plus" fill={'#FFFFFF'} opacity={0.4} />
    </AppEmpty>
  );
});
