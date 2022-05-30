import { FC } from 'react';
import { Flex } from 'renderer/components';
import { AppModelType } from 'core/ship/stores/docket';
import { AppTile } from 'renderer/components/AppTile';
import { useMst, useSpaces } from 'renderer/logic/store';
import { toJS } from 'mobx';
import { observer } from 'mobx-react';

interface AppTileProps {
  selected?: AppModelType;
}

export const AppDock: FC<AppTileProps> = observer(() => {
  const { desktopStore } = useMst();
  const spacesStore = useSpaces();

  const activeWindowId = desktopStore.activeWindow
    ? desktopStore.activeWindow.id
    : null;

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
