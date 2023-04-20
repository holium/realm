import { useMemo } from 'react';
import { observer } from 'mobx-react';
import rgba from 'polished/lib/color/rgba';
import { bgIsLightOrDark } from 'os/lib/color';
import {
  AppType,
  InstallStatus,
  UrbitAppType,
} from 'os/services/spaces/models/bazaar';
import { useServices } from 'renderer/logic/store';
import { SpaceModelType } from 'os/services/spaces/models/spaces';
import {
  ContextMenuOption,
  IconButton,
  Icons,
  AppTile,
} from 'renderer/components';
import { DesktopActions } from 'renderer/logic/actions/desktop';
import { ShellActions } from 'renderer/logic/actions/shell';
import { SpacesActions } from 'renderer/logic/actions/spaces';
import { getAppTileFlags } from 'renderer/logic/lib/app';
import {
  handleInstallation,
  resumeSuspendLabel,
  handleResumeSuspend,
  installLabel,
} from '../../AppInstall/helpers';
import { Box } from '@holium/design-system';

type Props = {
  index: number;
  app: AppType;
  space: SpaceModelType;
  isAdmin?: boolean;
};

const SuiteAppTilePresenter = ({ index, app, space, isAdmin }: Props) => {
  const { bazaar } = useServices();

  const appHost = useMemo(() => {
    if (app.type !== 'urbit') return null;
    return (app as UrbitAppType).host;
  }, [app]);

  const lightOrDark: 'light' | 'dark' = bgIsLightOrDark(app.color);
  const isLight = useMemo(() => lightOrDark === 'light', [lightOrDark]);
  const iconColor = useMemo(
    () => (isLight ? rgba('#333333', 0.7) : rgba('#FFFFFF', 0.7)),
    [isLight]
  );

  const isPinned = bazaar.isPinned(space.path, app.id);
  const weRecommended = bazaar.isRecommended(app.id);
  const installStatus =
    ((app as UrbitAppType).installStatus as InstallStatus) ||
    InstallStatus.installed;
  const { isInstalled, isUninstalled, isDesktop } =
    getAppTileFlags(installStatus);

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
      {(isUninstalled || isDesktop) && (
        <Box zIndex={3} position="absolute" right="14px" top="14px">
          <IconButton
            size={26}
            hoverFill={iconColor}
            customBg={rgba(iconColor, 0.12)}
            color={iconColor}
            onClick={onInstallation}
          >
            <Icons name="CloudDownload" />
          </IconButton>
        </Box>
      )}
      <AppTile
        tileId={`${app.id}-app`}
        tileSize="xl1"
        app={app}
        isAnimated={isInstalled}
        installStatus={installStatus}
        contextMenuOptions={contextMenuOptions}
        onAppClick={(selectedApp: AppType) => {
          DesktopActions.openAppWindow(selectedApp);
          DesktopActions.closeHomePane();
        }}
      />
    </Box>
  );
};

export const SuiteAppTile = observer(SuiteAppTilePresenter);
