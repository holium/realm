import { FC, useState, useEffect, useMemo } from 'react';
import { toJS } from 'mobx';
import { observer } from 'mobx-react';
import { AppTile, AppTileSize } from 'renderer/components/AppTile';
import { AppType } from 'os/services/spaces/models/bazaar';
import { useServices } from 'renderer/logic/store';
import { DesktopActions } from 'renderer/logic/actions/desktop';
import { SpacesActions } from 'renderer/logic/actions/spaces';

type AppGridProps = {
  isOpen?: boolean;
  tileSize: AppTileSize;
};

export const AppGrid: FC<AppGridProps> = observer((props: AppGridProps) => {
  const { isOpen, tileSize } = props;
  const { spaces, bazaar, ship } = useServices();
  const [apps, setApps] = useState<any>([]);

  const currentSpace = spaces.selected!;
  // const ourBazaar = bazaar.spaces.get(`/${ship!.patp}/our`);

  useEffect(() => {
    if (currentSpace) {
      // console.log(bazaar.getAvailableApps());
      setApps(
        bazaar
          .getAvailableApps()
          .filter(
            (app: any) =>
              app.type !== 'urbit' || (app.type === 'urbit' && app.installed)
          )
      );
    }
  }, [currentSpace, bazaar.appsChange]);

  return useMemo(
    () =>
      apps.map((app: any, index: number) => {
        const tags = app.tags || [];
        const isAppPinned = tags.includes('pinned');
        const weRecommended = bazaar.my.recommendations.includes(app.id);
        return (
          <AppTile
            key={app.title + index + 'grid'}
            isPinned={isAppPinned}
            allowContextMenu
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
                    ? SpacesActions.unrecommendApp(currentSpace?.path!, app.id)
                    : SpacesActions.recommendApp(currentSpace?.path!, app.id);
                },
              },
              {
                label: 'App info',
                disabled: true,
                onClick: (evt: any) => {
                  // evt.stopPropagation();
                  console.log('open app info');
                },
              },
              ...(app.type === 'urbit' && app.installed
                ? [
                    {
                      label: 'Uninstall',
                      // section: 2,
                      disabled: false,
                      onClick: (evt: any) => {
                        evt.stopPropagation();
                        console.log(`start uninstall`);
                        SpacesActions.uninstallApp(app.id);
                      },
                    },
                  ]
                : []),
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
              SpacesActions.addRecentApp(spaces.selected!.path, selectedApp.id);
              DesktopActions.openAppWindow(
                spaces.selected!.path,
                toJS(selectedApp)
              );
              DesktopActions.setHomePane(false);
            }}
          />
        );
      }),
    [apps, bazaar.my.recommendations]
  );
});

AppGrid.defaultProps = {
  tileSize: 'xxl',
};
