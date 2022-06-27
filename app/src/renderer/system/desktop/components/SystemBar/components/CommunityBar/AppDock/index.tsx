import { FC, useMemo } from 'react';
import { Flex, Divider } from 'renderer/components';
import { AppModelType } from 'core-a/ship/stores/docket';
import { AppTile } from 'renderer/components/AppTile';
import { toJS } from 'mobx';
import { observer } from 'mobx-react';
import { lighten, rgba } from 'polished';
import { Reorder } from 'framer-motion';
import { useServices } from 'renderer/logic/store-2';

interface AppDockProps {}

export const AppDock: FC<AppDockProps> = observer(() => {
  const { shell, spaces } = useServices();
  const { desktop, theme } = shell;

  const dividerBg = useMemo(
    () => rgba(lighten(0.2, theme.theme.dockColor), 0.4),
    [theme.theme]
  );

  const orderedList = useMemo(
    () => (spaces.selected ? spaces.selected.pinnedApps! : []),
    [spaces.selected?.apps.pinned, spaces.selected?.pinnedApps]
  );

  const pinnedApps = useMemo(() => {
    return (
      <Reorder.Group
        axis="x"
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'row',
          gap: 8,
        }}
        values={orderedList}
        onReorder={(newOrder: any) => {
          const newPinList = newOrder.map((app: any) => app.id);
          spaces.selected?.setPinnedOrder(newPinList);
        }}
      >
        {orderedList.map((app: AppModelType | any, index: number) => {
          const selected = desktop.isActiveWindow(app.id);
          const open = !selected && desktop.isOpenWindow(app.id);
          return (
            <Reorder.Item
              key={app.id}
              value={app}
              style={{ zIndex: 1 }}
              // onDragStart={(evt: any) => {
              //   evt.preventDefault();
              //   evt.stopPropagation();
              // }}
              // onDrag={(evt: any) => {
              //   evt.preventDefault();
              //   evt.stopPropagation();
              // }}
              // onDragEnd={(evt: any) => {
              //   evt.preventDefault();
              //   evt.stopPropagation();
              // }}
              onClick={(evt: any) => {
                const selectedApp = app;
                if (desktop.isOpenWindow(selectedApp.id)) {
                  desktop.setActive(selectedApp.id);
                } else {
                  desktop.openBrowserWindow(selectedApp);
                }
              }}
              whileDrag={{ zIndex: 20 }}
            >
              <AppTile
                allowContextMenu
                contextPosition="above"
                tileSize="sm"
                app={app}
                selected={selected}
                open={open}
                contextMenu={[
                  {
                    label: 'Unpin',
                    onClick: (evt: any) => {
                      evt.stopPropagation();
                      spaces.selected?.unpinApp(app.id);
                    },
                  },

                  {
                    label: 'Uninstall app',
                    disabled: true,
                    onClick: (evt: any) => {
                      evt.stopPropagation();
                      console.log('start uninstall');
                    },
                  },
                  {
                    label: 'Close',
                    section: 2,
                    onClick: (evt: any) => {
                      evt.stopPropagation();
                    },
                  },
                ]}
              />
            </Reorder.Item>
          );
        })}
      </Reorder.Group>
    );
  }, [
    desktop.activeWindow?.id,
    desktop.openAppIds,
    spaces.selected?.path,
    spaces.selected?.apps.pinned,
    spaces.selected?.pinnedApps,
  ]);

  const activeAndUnpinned = desktop.openApps.filter(
    (appWindow: any) =>
      spaces.selected &&
      spaces.selected.pinnedApps.findIndex(
        (pinned: any) => appWindow.id === pinned.id
      ) === -1
  );

  return (
    <Flex position="relative" flexDirection="row" alignItems="center">
      {pinnedApps}
      {activeAndUnpinned.length ? (
        <Divider customBg={dividerBg} ml={2} mr={2} />
      ) : (
        []
      )}
      <Flex position="relative" flexDirection="row" gap={8} alignItems="center">
        {activeAndUnpinned.map((unpinnedApp: any) => {
          const app = spaces.selected?.getAppData(unpinnedApp.id)!;
          const selected = desktop.isActiveWindow(app.id);
          const open = !selected && desktop.isOpenWindow(app.id);
          return (
            <AppTile
              key={`unpinned-${app.id}`}
              allowContextMenu
              contextPosition="above"
              tileSize="sm"
              app={app}
              selected={selected}
              open={open}
              contextMenu={[
                {
                  label: 'Unpin',
                  onClick: (evt: any) => {
                    evt.stopPropagation();
                    spaces.selected?.unpinApp(app.id);
                  },
                },
                {
                  label: 'Uninstall app',
                  disabled: true,
                  onClick: (evt: any) => {
                    evt.stopPropagation();
                    console.log('start uninstall');
                  },
                },
                {
                  label: 'Close',
                  section: 2,
                  onClick: (evt: any) => {
                    evt.stopPropagation();
                  },
                },
              ]}
              onAppClick={(selectedApp: any) => {
                if (desktop.isOpenWindow(selectedApp.id)) {
                  desktop.setActive(selectedApp.id);
                } else {
                  desktop.openBrowserWindow(selectedApp);
                }
              }}
            />
          );
        })}
      </Flex>
    </Flex>
  );
});
