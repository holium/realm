import { AppTileSize, InstallStatus } from '@holium/design-system';
import { toJS } from 'mobx';
import { useMemo } from 'react';
import { ContextMenuOption, AppTile } from 'renderer/components';
import { useAppState } from 'renderer/stores/app.store';
import {
  AppMobxType,
  AppTypes,
  BazaarStoreType,
} from 'renderer/stores/models/bazaar.model';
import { SpaceModelType } from 'renderer/stores/models/spaces.model';
import {
  handleInstallation,
  handleResumeSuspend,
  installLabel,
  resumeSuspendLabel,
} from '../AppInstall/helpers';

type AppProps = {
  tileId: string;
  tileSize: AppTileSize;
  app: AppMobxType;
  currentSpace: SpaceModelType;
  bazaarStore: BazaarStoreType;
};

export const AppGridTile = ({
  tileId,
  tileSize,
  app,
  currentSpace,
  bazaarStore,
}: AppProps) => {
  const { shellStore } = useAppState();
  const isAppPinned = currentSpace.isPinned(app.id);
  const weRecommended = bazaarStore.isRecommended(app.id);
  const installStatus = app.installStatus as InstallStatus;

  const canSuspend =
    (installStatus === InstallStatus.installed ||
      installStatus === InstallStatus.suspended) &&
    app.type === 'urbit';

  const contextMenuOptions = useMemo(
    () =>
      [
        {
          label: isAppPinned ? 'Unpin app' : 'Pin app',
          disabled: app.type === AppTypes.Web,
          onClick: (evt: any) => {
            evt.stopPropagation();
            isAppPinned
              ? currentSpace.unpinApp(app.id)
              : currentSpace.pinApp(app.id);
          },
        },
        {
          label: weRecommended ? 'Unrecommend app' : 'Recommend app',
          disabled: app.type === AppTypes.Web,
          onClick: (evt: any) => {
            evt.stopPropagation();
            weRecommended
              ? bazaarStore.unrecommendApp(app.id)
              : bazaarStore.recommendApp(app.id);
          },
        },
        {
          label: 'App info',
          disabled: app.type === AppTypes.Web,
          onClick: (evt: any) => {
            evt.stopPropagation();
            shellStore.openDialogWithStringProps('app-detail-dialog', {
              appId: app.id,
            });
          },
        },
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
          label: installLabel(installStatus),
          section: 2,
          disabled: false,
          onClick: (evt: any) => {
            evt.stopPropagation();
            const appHost = (app as AppMobxType).host;
            return handleInstallation(appHost, app.id, installStatus);
          },
        },
      ].filter(Boolean) as ContextMenuOption[],
    [isAppPinned, weRecommended, app, currentSpace, installStatus]
  );

  return (
    <AppTile
      tileId={tileId}
      isAnimated={
        installStatus !== InstallStatus.suspended &&
        installStatus !== InstallStatus.failed
      }
      installStatus={installStatus}
      tileSize={tileSize}
      app={app as AppMobxType}
      contextMenuOptions={contextMenuOptions}
      onAppClick={(selectedApp: AppMobxType) => {
        shellStore.openWindow(toJS(selectedApp));
        shellStore.closeHomePane();
      }}
    />
  );
};
