import { useMemo } from 'react';
import { observer } from 'mobx-react';

import { Box, Button, Icon } from '@holium/design-system';

import { AppTile, ContextMenuOption } from 'renderer/components';
import { getAppTileFlags } from 'renderer/lib/app';
import { useAppState } from 'renderer/stores/app.store';
import {
  AppMobxType,
  InstallStatus,
  AppTypes,
} from 'renderer/stores/models/bazaar.model';
import { SpaceModelType } from 'renderer/stores/models/spaces.model';
import { useShipStore } from 'renderer/stores/ship.store';

import {
  handleInstallation,
  handleResumeSuspend,
  installLabel,
  resumeSuspendLabel,
} from '../../AppInstall/helpers';

type Props = {
  index: number;
  app: AppMobxType;
  space: SpaceModelType;
  isAdmin?: boolean;
};

const SuiteAppTilePresenter = ({ index, app, space, isAdmin }: Props) => {
  const { shellStore } = useAppState();
  const { bazaarStore, spacesStore } = useShipStore();
  const currentSpace = spacesStore.selected;

  const appHost = useMemo(() => {
    if (app.type !== 'urbit') return null;
    return (app as AppMobxType).host;
  }, [app]);

  const isPinned = currentSpace?.isPinned(app.id);
  const weRecommended = bazaarStore.isRecommended(app.id);
  const appRef = bazaarStore.catalog.get(app.id);
  const installStatus = appRef?.installStatus as InstallStatus;
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
              ? currentSpace?.unpinApp(app.id)
              : currentSpace?.pinApp(app.id);
          },
        },
        {
          label: weRecommended ? 'Unrecommend app' : 'Recommend app',
          disabled: app.type !== AppTypes.Urbit,
          onClick: (evt: any) => {
            evt.stopPropagation();
            weRecommended
              ? bazaarStore.unrecommendApp(app.id)
              : bazaarStore.recommendApp(app.id);
          },
        },
        {
          label: 'App info',
          // disabled: app.type === 'dev',
          onClick: (evt: any) => {
            evt.stopPropagation();
            shellStore.openDialogWithStringProps('app-detail-dialog', {
              appId: app.id,
            });
          },
        },
        isAdmin && {
          label: 'Remove from suite',
          onClick: (evt: any) => {
            evt.stopPropagation();
            currentSpace?.removeFromSuite(index);
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
          <Button.IconButton
            size={26}
            // hoverFill={iconColor}
            // customBg={rgba(iconColor, 0.12)}
            // color={iconColor}
            onClick={onInstallation}
          >
            <Icon name="CloudDownload" size={20} />
          </Button.IconButton>
        </Box>
      )}
      <AppTile
        tileId={`${app.id}-app`}
        tileSize="xl1"
        app={app as AppMobxType}
        isAnimated={isInstalled}
        installStatus={installStatus}
        contextMenuOptions={contextMenuOptions}
        onAppClick={(selectedApp: AppMobxType) => {
          shellStore.openWindow(selectedApp);
          shellStore.closeHomePane();
        }}
      />
    </Box>
  );
};

export const SuiteAppTile = observer(SuiteAppTilePresenter);
