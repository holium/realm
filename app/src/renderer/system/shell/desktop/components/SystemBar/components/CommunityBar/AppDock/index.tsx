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
  const { desktopStore, themeStore } = useMst();
  const spacesStore = useSpaces();

  const { ship } = useShip();

  const activeWindowId = desktopStore.activeWindow
    ? desktopStore.activeWindow.id
    : null;

  const onAppClick = (app: AppModelType) => {
    const formAppUrl = `${ship!.url}/apps/${app.id!}`;
    const windowPayload = {
      name: app.id!,
      url: formAppUrl,
      customCSS: {},
      theme: themeStore,
      cookies: {
        url: formAppUrl,
        name: `urbauth-${ship!.patp}`,
        value: ship!.cookie!.split('=')[1].split('; ')[0],
      },
    };

    desktopStore.openBrowserWindow(app, windowPayload);
  };

  // console.log('activeWindowId', activeWindowId);

  return (
    <Flex position="relative" gap={8} flexDirection="row" alignItems="center">
      {spacesStore.selected
        ? spacesStore.selected.pinnedApps.map(
            (app: AppModelType | any, index: number) => {
              // console.log(
              //   'selected',
              //   app.href.glob.base,
              //   app.href.glob.base === activeWindowId
              // );
              return (
                <AppTile
                  allowContextMenu
                  contextPosition="above"
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
                      onClick: (evt: any) => {
                        evt.stopPropagation();
                        console.log('start uninstall');
                      },
                    },
                  ]}
                  key={app.title + index}
                  tileSize="sm"
                  app={app}
                  selected={app.id === activeWindowId}
                  onAppClick={(selectedApp: AppModelType) =>
                    onAppClick(selectedApp)
                  }
                />
              );
            }
          )
        : []}
    </Flex>
  );
});
