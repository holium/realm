import { FC, useMemo } from 'react';
import { Flex, Divider } from 'renderer/components';
import { AppModelType } from 'core/ship/stores/docket';
import { AppTile } from 'renderer/components/AppTile';
import { useMst, useSpaces } from 'renderer/logic/store';
import { toJS } from 'mobx';
import { observer } from 'mobx-react';
import { lighten, rgba } from 'polished';
import { Reorder } from 'framer-motion';

interface AppDockProps {}

export const AppDock: FC<AppDockProps> = observer(() => {
  const { desktopStore, themeStore } = useMst();
  const spacesStore = useSpaces();

  const dividerBg = useMemo(
    () => rgba(lighten(0.2, themeStore.theme.dockColor), 0.4),
    [themeStore.theme]
  );

  const orderedList = useMemo(
    () => (spacesStore.selected ? spacesStore.selected.pinnedApps! : []),
    [spacesStore.selected?.apps.pinned, spacesStore.selected?.pinnedApps]
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
          spacesStore.selected?.setPinnedOrder(newPinList);
        }}
      >
        {orderedList.map((app: AppModelType | any, index: number) => {
          const selected = desktopStore.isActiveWindow(app.id);
          const open = !selected && desktopStore.isOpenWindow(app.id);
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
                if (desktopStore.isOpenWindow(selectedApp.id)) {
                  desktopStore.setActive(selectedApp.id);
                } else {
                  desktopStore.openBrowserWindow(selectedApp);
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
                      spacesStore.selected?.unpinApp(app.id);
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
    desktopStore.activeWindow?.id,
    desktopStore.openAppIds,
    spacesStore.selected?.id,
    spacesStore.selected?.apps.pinned,
    spacesStore.selected?.pinnedApps,
  ]);

  const activeAndUnpinned = desktopStore.openApps.filter(
    (appWindow) =>
      spacesStore.selected &&
      spacesStore.selected.pinnedApps.findIndex(
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
          const app = spacesStore.selected?.getAppData(unpinnedApp.id)!;
          const selected = desktopStore.isActiveWindow(app.id);
          const open = !selected && desktopStore.isOpenWindow(app.id);
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
                    spacesStore.selected?.unpinApp(app.id);
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
                if (desktopStore.isOpenWindow(selectedApp.id)) {
                  desktopStore.setActive(selectedApp.id);
                } else {
                  desktopStore.openBrowserWindow(selectedApp);
                }
              }}
            />
          );
        })}
      </Flex>
    </Flex>
  );
});
