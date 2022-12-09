import { FC } from 'react';
import { toJS } from 'mobx';
import { observer } from 'mobx-react';
import { AppTile, AppTileSize } from 'renderer/components/AppTile';
import {
  AppType,
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
  isOpen?: boolean;
  tileSize: AppTileSize;
}

export const AppGrid: FC<AppGridProps> = observer((props: AppGridProps) => {
  const { isOpen, tileSize } = props;
  const { spaces, bazaar } = useServices();

  const currentSpace = spaces.selected!;
  const dock = bazaar.getDock(currentSpace.path);
  // console.log(toJS(bazaar.gridIndex));

  // return useMemo(() => {
  const apps = [...bazaar.installed, ...bazaar.devApps];
  return (
    <>
      {apps.map((app: any, index: number) => {
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
                  // section: 2,
                  disabled: false,
                  onClick: (evt: any) => {
                    evt.stopPropagation();
                    const appHost = (app as UrbitAppType).host;
                    return handleInstallation(appHost, app.id, installStatus);
                  },
                },
              ]
            : [];

        return (
          <AppTile
            key={`${app.title} ${index} grid`}
            isPinned={isAppPinned}
            isRecommended={weRecommended}
            isAnimated={
              installStatus !== InstallStatus.suspended &&
              installStatus !== InstallStatus.failed
            }
            allowContextMenu
            installStatus={installStatus}
            tileSize={tileSize}
            app={app}
            isVisible={isOpen}
            contextMenu={[
              {
                label: isAppPinned ? 'Unpin app' : 'Pin app',
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
            onAppClick={(selectedApp: AppType) => {
              SpacesActions.addRecentApp(currentSpace.path, selectedApp.id);
              DesktopActions.openAppWindow(
                currentSpace.path,
                toJS(selectedApp)
              );
              DesktopActions.setHomePane(false);
            }}
          />
        );
      })}
    </>
  );
  // }, [
  //   bazaar.catalog,
  //   bazaar.installed,
  //   bazaar.installed.length,
  //   dock?.length,
  //   bazaar.recommendations.length,
  // ]);
});

AppGrid.defaultProps = {
  tileSize: 'xxl',
};
