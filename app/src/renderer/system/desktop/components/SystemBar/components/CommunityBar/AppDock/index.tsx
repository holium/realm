import { FC } from 'react';
import { Flex } from 'renderer/components';
import { AppModelType } from 'core/ship/stores/docket';
import { AppTile } from 'renderer/components/AppTile';
import { useMst, useShip, useSpaces } from 'renderer/logic/store';
import { toJS } from 'mobx';
import { observer } from 'mobx-react';

interface AppTileProps {
  selected?: AppModelType;
}

export const AppDock: FC<AppTileProps> = observer(() => {
  const { ship } = useShip();
  const { desktopStore, themeStore } = useMst();
  const spacesStore = useSpaces();

  const activeWindowId = desktopStore.activeWindow
    ? desktopStore.activeWindow.id
    : null;
  console.log(activeWindowId);
  // const onAppClick = (app: AppModelType) => {
  //   const formAppUrl = `${ship!.url}/apps/${app.id!}`;
  //   const windowPayload = {
  //     name: app.id!,
  //     url: formAppUrl,
  //     customCSS: {},
  //     theme: themeStore,
  //     cookies: {
  //       url: formAppUrl,
  //       name: `urbauth-${ship!.patp}`,
  //       value: ship!.cookie!.split('=')[1].split('; ')[0],
  //     },
  //   };
  //   desktopStore.openBrowserWindow(selectedApp, windowPayload);
  // };

  // console.log('activeWindowId', activeWindowId);

  return (
    <Flex position="relative" gap={8} flexDirection="row" alignItems="center">
      {spacesStore.selected
        ? spacesStore.selected.pinnedApps.map(
            (app: AppModelType | any, index: number) => {
              return (
                <AppTile
                  key={app.title + index}
                  allowContextMenu
                  contextPosition="above"
                  tileSize="sm"
                  app={app}
                  selected={app.id === activeWindowId}
                  contextMenu={[
                    {
                      label: 'Unpin',
                      onClick: (evt: any) => {
                        evt.stopPropagation();
                        spacesStore.selected?.unpinApp(app.id);
                      },
                    },
                    {
                      label: 'Uninstall app',
                      section: 2,
                      disabled: true,
                      onClick: (evt: any) => {
                        evt.stopPropagation();
                        console.log('start uninstall');
                      },
                    },
                  ]}
                  onAppClick={(selectedApp: AppModelType) => {
                    desktopStore.openBrowserWindow(selectedApp);
                  }}
                />
              );
            }
          )
        : []}
    </Flex>
  );
});
