import { toJS } from 'mobx';
import { observer } from 'mobx-react';
import { AppTile, AppTileSize } from 'renderer/components/AppTile/AppTile';
import {
  AppType,
  AppTypes,
  InstallStatus,
  UrbitAppType,
  WebAppType,
} from 'os/services/spaces/models/bazaar';
import {
  handleInstallation,
  handleResumeSuspend,
  installLabel,
  resumeSuspendLabel,
} from '../AppInstall/helpers';
import { useShipStore } from 'renderer/stores/ship.store';
import { useAppState } from 'renderer/stores/app.store';

interface AppGridProps {
  tileSize: AppTileSize;
}

const AppGridPresenter = ({ tileSize = 'xxl' }: AppGridProps) => {
  const { shellStore } = useAppState();
  const { bazaarStore, spacesStore } = useShipStore();
  const currentSpace = spacesStore.selected;
  const apps = [...bazaarStore.installed, ...bazaarStore.devApps] as
    | AppType[]
    | WebAppType[];

  if (!currentSpace) return null;

  return (
    <>
      {apps.map((app, index: number) => {
        const isAppPinned = currentSpace.isPinned(app.id);
        const weRecommended = bazaarStore.isRecommended(app.id);
        const installStatus = app.installStatus as InstallStatus;

        const canSuspend =
          (installStatus === InstallStatus.installed ||
            installStatus === InstallStatus.suspended) &&
          app.type === 'urbit';

        const suspendRow = canSuspend
          ? [
              {
                label: resumeSuspendLabel(installStatus),
                section: 2,
                disabled: false,
                onClick: (evt: any) => {
                  evt.stopPropagation();
                  return handleResumeSuspend(app.id, installStatus);
                },
              },
            ]
          : [];

        const installRow =
          app.type === 'urbit'
            ? [
                {
                  label: installLabel(installStatus),
                  section: 2,
                  disabled: false,
                  onClick: (evt: any) => {
                    evt.stopPropagation();
                    const appHost = (app as UrbitAppType).host;
                    return handleInstallation(appHost, app.id, installStatus);
                  },
                },
              ]
            : [];
        const tileId = `${app.title}-${index}-grid`;

        return (
          <AppTile
            key={tileId}
            tileId={tileId}
            isAnimated={
              installStatus !== InstallStatus.suspended &&
              installStatus !== InstallStatus.failed
            }
            installStatus={installStatus}
            tileSize={tileSize}
            app={app as AppType}
            contextMenuOptions={[
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
              ...suspendRow,
              ...installRow,
            ]}
            onAppClick={(selectedApp) => {
              shellStore.openWindow(toJS(selectedApp));
              shellStore.closeHomePane();
            }}
          />
        );
      })}
    </>
  );
};

export const AppGrid = observer(AppGridPresenter);
