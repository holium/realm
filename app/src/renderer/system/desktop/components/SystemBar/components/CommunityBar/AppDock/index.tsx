import { FC, useMemo } from 'react';
import { Flex, Divider } from 'renderer/components';
import { AppModelType } from 'core/ship/stores/docket';
import { AppTile } from 'renderer/components/AppTile';
import { useMst, useSpaces } from 'renderer/logic/store';
import { toJS } from 'mobx';
import { observer } from 'mobx-react';
import { lighten, rgba } from 'polished';

interface AppDockProps {}

export const AppDock: FC<AppDockProps> = observer(() => {
  const { desktopStore, themeStore } = useMst();
  const spacesStore = useSpaces();

  const activeAndUnpinned = desktopStore.openApps.filter(
    (appWindow) =>
      spacesStore.selected &&
      spacesStore.selected.pinnedApps.findIndex(
        (pinned: any) => appWindow.id !== pinned.id
      ) == -1
  );

  const dividerBg = useMemo(
    () => rgba(lighten(0.2, themeStore.theme.dockColor), 0.4),
    [themeStore.theme]
  );

  const pinnedApps = useMemo(() => {
    return spacesStore.selected
      ? spacesStore.selected.pinnedApps.map(
          (app: AppModelType | any, index: number) => {
            const selected = desktopStore.isActiveWindow(app.id);
            const open = !selected && desktopStore.isOpenWindow(app.id);
            return (
              <AppTile
                key={app.title + index}
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
                    section: 2,
                    disabled: true,
                    onClick: (evt: any) => {
                      evt.stopPropagation();
                      console.log('start uninstall');
                    },
                  },
                ]}
                onAppClick={(selectedApp: AppModelType) => {
                  if (desktopStore.isOpenWindow(selectedApp.id)) {
                    desktopStore.setActive(selectedApp.id);
                  } else {
                    desktopStore.openBrowserWindow(selectedApp);
                  }
                }}
              />
            );
          }
        )
      : [];
  }, [
    desktopStore.openAppIds,
    desktopStore.activeWindow,
    spacesStore.selected?.pinnedApps,
    spacesStore.selected?.id,
  ]);

  // TODO fix this
  // const unPinnedApps = useMemo(() => {
  //   return activeAndUnpinned.map((app: AppModelType | any, index: number) => {
  //     return (
  //       <AppTile
  //         key={app.title + index}
  //         allowContextMenu
  //         contextPosition="above"
  //         tileSize="sm"
  //         app={app}
  //         selected={desktopStore.isActiveWindow(app.id)}
  //         contextMenu={[
  //           {
  //             label: 'Unpin',
  //             onClick: (evt: any) => {
  //               evt.stopPropagation();
  //               spacesStore.selected?.unpinApp(app.id);
  //             },
  //           },
  //           {
  //             label: 'Uninstall app',
  //             section: 2,
  //             disabled: true,
  //             onClick: (evt: any) => {
  //               evt.stopPropagation();
  //               console.log('start uninstall');
  //             },
  //           },
  //         ]}
  //         onAppClick={(selectedApp: AppModelType) => {
  //           desktopStore.openBrowserWindow(selectedApp);
  //         }}
  //       />
  //     );
  //   });
  // }, [activeAndUnpinned]);

  return (
    <Flex position="relative" gap={8} flexDirection="row" alignItems="center">
      {pinnedApps}
      {activeAndUnpinned.length ? (
        <Divider customBg={dividerBg} ml={2} mr={2} />
      ) : (
        []
      )}
      {/* {unPinnedApps} */}
    </Flex>
  );
});
