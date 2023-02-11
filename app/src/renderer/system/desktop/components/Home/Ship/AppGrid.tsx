import { toJS } from 'mobx';
import { observer } from 'mobx-react';
import { AppTile, AppTileSize } from 'renderer/components/AppTile/AppTile';
import {
  AppType,
  DevAppType,
  InstallStatus,
  UrbitAppType,
} from 'os/services/spaces/models/bazaar';
import { useServices } from 'renderer/logic/store';
import { DesktopActions } from 'renderer/logic/actions/desktop';
import { SpacesActions } from 'renderer/logic/actions/spaces';
import { ShellActions } from 'renderer/logic/actions/shell';
import {
  handleInstallation,
  handleResumeSuspend,
  installLabel,
  resumeSuspendLabel,
} from '../AppInstall/helpers';

interface AppGridProps {
  tileSize: AppTileSize;
}

const AppGridPresenter = ({ tileSize = 'xxl' }: AppGridProps) => {
  const { spaces, bazaar } = useServices();
  const currentSpace = spaces.selected!;
  const apps = [...bazaar.installed, ...bazaar.devApps] as (
    | AppType
    | DevAppType
  )[];

  return (
    <>
      {apps.map((app, index: number) => {
        const isAppPinned = bazaar.isPinned(currentSpace.path, app.id);
        const weRecommended = bazaar.isRecommended(app.id);
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
            app={app}
            contextMenuOptions={[
              {
                label: isAppPinned ? 'Unpin app' : 'Pin app',
                // @ts-ignore
                disabled: app.type === 'web',
                onClick: (evt: any) => {
                  evt.stopPropagation();
                  isAppPinned
                    ? SpacesActions.unpinApp(currentSpace?.path, app.id)
                    : SpacesActions.pinApp(currentSpace?.path, app.id);
                },
              },
              {
                label: weRecommended ? 'Unrecommend app' : 'Recommend app',
                // @ts-ignore
                disabled: app.type === 'web',
                onClick: (evt: any) => {
                  evt.stopPropagation();
                  weRecommended
                    ? SpacesActions.unrecommendApp(app.id)
                    : SpacesActions.recommendApp(app.id);
                },
              },
              {
                label: 'App info',
                // @ts-ignore
                disabled: app.type === 'web',
                onClick: (evt: any) => {
                  evt.stopPropagation();
                  ShellActions.openDialogWithStringProps('app-detail-dialog', {
                    appId: app.id,
                  });
                },
              },
              ...suspendRow,
              ...installRow,
            ]}
            onAppClick={(selectedApp) => {
              DesktopActions.openAppWindow(toJS(selectedApp));
              DesktopActions.closeHomePane();
            }}
          />
        );
      })}
    </>
  );
};

export const AppGrid = observer(AppGridPresenter);
