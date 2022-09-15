import { FC, useState, useEffect } from 'react';
import { toJS, isObservable } from 'mobx';
import { observer } from 'mobx-react';
import { AppTile, AppTileSize } from 'renderer/components/AppTile';
import { AppModelType } from 'os/services/ship/models/docket';
import { useServices } from 'renderer/logic/store';
import { DesktopActions } from 'renderer/logic/actions/desktop';
import { SpacesActions } from 'renderer/logic/actions/spaces';

type AppGridProps = {
  isOpen?: boolean;
  tileSize: AppTileSize;
};

export const AppGrid: FC<AppGridProps> = observer((props: AppGridProps) => {
  const { isOpen, tileSize } = props;
  const { spaces, bazaar } = useServices();
  const [apps, setApps] = useState<any>([]);

  const currentSpace = spaces.selected!;
  const currentBazaar = bazaar.spaces.get(currentSpace.path);

  useEffect(() => {
    if (currentSpace) {
      setApps(bazaar.getApps(currentSpace.path));
    }
  }, [currentSpace, currentBazaar?.pinnedChange]);

  return apps.map((app: any, index: number) => {
    const spacePath = spaces.selected?.path!;
    const tags = app.tags || [];
    const isAppPinned = tags.includes('pinned');
    const isAppRecommended = tags.includes('recommended');
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
            disabled: false,
            onClick: (evt: any) => {
              evt.stopPropagation();
              isAppPinned
                ? SpacesActions.unpinApp(spacePath, app.id)
                : SpacesActions.pinApp(spacePath, app.id);
            },
          },
          {
            label: 'Add to recommendations',
            disabled: isAppRecommended,
            onClick: (evt: any) => {
              evt.stopPropagation();
              SpacesActions.recommendApp(spacePath, app.id);
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
          // console.log(selectedApp);
          SpacesActions.addRecentApp(spaces.selected!.path, selectedApp.id);
          DesktopActions.openAppWindow(spaces.selected!.path, selectedApp);
          DesktopActions.setHomePane(false);
        }}
      />
    );
  });
});

AppGrid.defaultProps = {
  tileSize: 'xxl',
};
