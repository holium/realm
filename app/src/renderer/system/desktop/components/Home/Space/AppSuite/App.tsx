import React, { useMemo } from 'react';
import styled, { css } from 'styled-components';
import { rgba } from 'polished';
import {
  Box,
  AppTile,
  Icons,
  BoxProps,
  IconButton,
  ContextMenuOption,
} from 'renderer/components';
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
import {
  handleInstallation,
  handleResumeSuspend,
  installLabel,
  resumeSuspendLabel,
} from '../../AppInstall/helpers';
import { getAppTileFlags } from 'renderer/logic/lib/app';
import { ShellActions } from 'renderer/logic/actions/shell';

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

export const SuiteApp = observer((props: SuiteAppProps) => {
  const { id, selected, index, accentColor, app, space, isAdmin, onClick } =
    props;
  const { bazaar } = useServices();
  const appHost = useMemo(() => {
    if (app?.type !== 'urbit') return null;
    return (app as UrbitAppType).host;
  }, [app]);

  if (app) {
    const isPinned = bazaar.isPinned(space.path, app.id);
    const weRecommended = bazaar.isRecommended(app.id);
    const installStatus =
      ((app as UrbitAppType).installStatus as InstallStatus) ||
      InstallStatus.installed;
    const { isInstalled, isUninstalled } = getAppTileFlags(installStatus);

    const onInstallation = (evt: React.MouseEvent<HTMLButtonElement>) => {
      evt.stopPropagation();
      return handleInstallation(appHost, app.id, installStatus);
    };
    const canSuspend =
      (installStatus === InstallStatus.installed ||
        installStatus === InstallStatus.suspended) &&
      app.type === 'urbit';

    const contextMenuOptions = useMemo(
      () =>
        [
          {
            label: isPinned ? 'Unpin' : 'Pin',
            onClick: (evt: any) => {
              evt.stopPropagation();
              isPinned
                ? SpacesActions.unpinApp(space.path, app.id)
                : SpacesActions.pinApp(space.path, app.id, null);
            },
          },
          {
            label: weRecommended ? 'Unrecommend app' : 'Recommend app',
            onClick: (evt: any) => {
              evt.stopPropagation();
              weRecommended
                ? SpacesActions.unrecommendApp(app.id)
                : SpacesActions.recommendApp(app.id);
            },
          },
          {
            label: 'App info',
            disabled: app.type === 'dev',
            onClick: (evt: any) => {
              evt.stopPropagation();
              ShellActions.openDialogWithStringProps('app-detail-dialog', {
                appId: app.id,
              });
            },
          },
          isAdmin && {
            label: 'Remove from suite',
            onClick: (evt: any) => {
              evt.stopPropagation();
              SpacesActions.removeFromSuite(space.path, index);
            },
          },
          app.type === 'urbit' &&
            canSuspend && {
              label: resumeSuspendLabel(installStatus),
              section: 2,
              disabled: false,
              onClick: (evt: any) => {
                evt.stopPropagation();
                return handleResumeSuspend(app.id, installStatus);
              },
            },
          app.type === 'urbit' && {
            label: installLabel(app.installStatus as InstallStatus),
            disabled: false,
            section: 2,
            onClick: (evt: any) => {
              evt.stopPropagation();
              if (!appHost) throw new Error('App host is undefined');
              return handleInstallation(
                appHost,
                app.id,
                app.installStatus as InstallStatus
              );
            },
          },
        ].filter(Boolean) as ContextMenuOption[],
      [
        appHost,
        app.id,
        app.installStatus,
        app.type,
        canSuspend,
        index,
        installStatus,
        isAdmin,
        isPinned,
        space.path,
        weRecommended,
      ]
    );

    return (
      <Box position="relative">
        {isUninstalled && (
          <Box zIndex={3} position="absolute" right="14px" top="14px">
            <IconButton size={26} color={accentColor} onClick={onInstallation}>
              <Icons name="CloudDownload" />
            </IconButton>
          </Box>
        )}
        <AppTile
          tileId={`${id}-app`}
          tileSize="xl1"
          app={app}
          isAnimated={isInstalled}
          installStatus={installStatus}
          contextMenuOptions={contextMenuOptions}
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
