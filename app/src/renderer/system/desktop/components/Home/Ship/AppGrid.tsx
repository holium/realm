import { FC, useMemo } from 'react';
import { toJS } from 'mobx';
import { observer } from 'mobx-react';
import { AppTile, AppTileSize } from 'renderer/components/AppTile';
import { AppType, InstallStatus } from 'os/services/spaces/models/bazaar';
import { useServices } from 'renderer/logic/store';
import { DesktopActions } from 'renderer/logic/actions/desktop';
import { SpacesActions } from 'renderer/logic/actions/spaces';
import { ShellActions } from 'renderer/logic/actions/shell';

type AppGridProps = {
  isOpen?: boolean;
  tileSize: AppTileSize;
};

export const AppGrid: FC<AppGridProps> = observer((props: AppGridProps) => {
  const { isOpen, tileSize } = props;
  const { spaces, bazaar, ship } = useServices();

  const currentSpace = spaces.selected!;
  const dock = bazaar.getDock(currentSpace.path);

  // const currentBazaar = useMemo(() => bazaar.getPinnedApps(currentSpace.path), [currentSpace]);
  // const currentBazaar = bazaar.getBazaar(currentSpace.path);

  return useMemo(() => {
    const apps = [...bazaar.installed, ...bazaar.installing];
    // apps.push(bazaar.installing);
    return (
      <>
        {apps.map((app: any, index: number) => {
          const isAppPinned = bazaar.isPinned(currentSpace.path, app.id);
          const weRecommended = bazaar.isRecommended(app.id);
          return (
            <AppTile
              key={app.title + index + 'grid'}
              isPinned={isAppPinned}
              isRecommended={weRecommended}
              allowContextMenu
              // isInstalling
              isInstalling={app.installStatus !== InstallStatus.installed}
              tileSize={tileSize}
              app={app}
              isVisible={isOpen}
              contextMenu={[
                {
                  label: isAppPinned ? 'Unpin app' : 'Pin app',
                  disabled: false,
                  onClick: (evt: any) => {
                    evt.stopPropagation();
                    isAppPinned
                      ? SpacesActions.unpinApp(currentSpace?.path!, app.id)
                      : SpacesActions.pinApp(currentSpace?.path!, app.id);
                  },
                },
                {
                  label: weRecommended ? 'Unrecommend app' : 'Recommend app',
                  disabled: false,
                  onClick: (evt: any) => {
                    evt.stopPropagation();
                    weRecommended
                      ? SpacesActions.unrecommendApp(app.id)
                      : SpacesActions.recommendApp(app.id);
                  },
                },
                {
                  label: 'App info',
                  onClick: (evt: any) => {
                    evt.stopPropagation();
                    ShellActions.openDialogWithStringProps(
                      'app-detail-dialog',
                      { appId: app.id }
                    );
                  },
                },

                ...(app.type === 'urbit' &&
                app.installStatus === InstallStatus.installed
                  ? [
                      {
                        label: 'Uninstall',
                        section: 2,
                        disabled: false,
                        onClick: (evt: any) => {
                          evt.stopPropagation();
                          console.log(`start uninstall`);
                          SpacesActions.uninstallApp(app.id);
                        },
                      },
                    ]
                  : [
                      {
                        label: 'Install',
                        section: 2,
                        disabled: false,
                        onClick: (evt: any) => {
                          evt.stopPropagation();
                          // console.log(`start install`, toJS(app));

                          // SpacesActions.installApp(toJS(app));
                        },
                      },
                    ]),
              ]}
              variants={
                {
                  // hidden: {
                  //   opacity: 0,
                  //   top: 30,
                  //   transition: { top: 3, opacity: 1 },
                  // },
                  // show: {
                  //   opacity: 1,
                  //   top: 0,
                  //   transition: { top: 3, opacity: 1 },
                  // },
                  // exit: { opacity: 0, top: 100 },
                }
              }
              onAppClick={(selectedApp: AppType) => {
                // @ts-ignore
                SpacesActions.addRecentApp(
                  spaces.selected!.path,
                  selectedApp.id
                );
                DesktopActions.openAppWindow(
                  spaces.selected!.path,
                  toJS(selectedApp)
                );
                DesktopActions.setHomePane(false);
              }}
            />
          );
        })}
      </>
    );
  }, [
    currentSpace,
    bazaar.catalog,
    bazaar.installed.length,
    bazaar.installing.length,
    dock?.length,
    bazaar.recommendations.length,
  ]);
});

AppGrid.defaultProps = {
  tileSize: 'xxl',
};
