import { FC, useState, useEffect, useMemo } from 'react';
import { toJS } from 'mobx';
import { observer } from 'mobx-react';
import { AppTile, AppTileSize } from 'renderer/components/AppTile';
import { AppModelType } from 'os/services/ship/models/docket';
import { NativeAppList } from 'renderer/apps';
import { useServices } from 'renderer/logic/store';
import { DesktopActions } from 'renderer/logic/actions/desktop';
import { SpacesActions } from 'renderer/logic/actions/spaces';

type AppGridProps = {
  isOpen?: boolean;
  tileSize: AppTileSize;
};

export const AppGrid: FC<AppGridProps> = observer((props: AppGridProps) => {
  const { isOpen, tileSize } = props;
  const { docket, spaces, bazaar } = useServices();

  // const apps: any = ship
  //   ? [...ship!.apps, ...NativeAppList]
  //   : [...NativeAppList];

  const currentBazaar = spaces.selected
    ? bazaar.getBazaar(spaces.selected?.path)
    : null;

  const apps: any = currentBazaar?.allApps;

  return apps.map((app: any, index: number) => {
    const spacePath = spaces.selected?.path!;
    const isAppPinned =
      (currentBazaar && currentBazaar.isAppPinned(app.id)) || false;
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
            label: isAppPinned ? 'Unpin app' : 'Pin to taskbar',
            onClick: (evt: any) => {
              evt.stopPropagation();
              isAppPinned
                ? SpacesActions.removeAppTag(spacePath, app.id, 'pinned')
                : SpacesActions.addAppTag(spacePath, app.id, 'pinned');
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
          {
            label: 'Uninstall app',
            section: 2,
            disabled: true,
            onClick: (evt: any) => {
              // evt.stopPropagation();
              console.log('start uninstall');
            },
          },
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
        onAppClick={(selectedApp: AppModelType) => {
          console.log(selectedApp);
          SpacesActions.addRecentApp(spaces.selected!.path, selectedApp.id);
          DesktopActions.openAppWindow(
            spaces.selected!.path,
            toJS(selectedApp)
          );
          DesktopActions.setHomePane(false);
        }}
      />
    );
  });
});

AppGrid.defaultProps = {
  tileSize: 'xxl',
};
