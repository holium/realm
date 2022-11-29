import { FC, useMemo } from 'react';
import { Flex, Divider } from 'renderer/components';
import { AppType, InstallStatus } from 'os/services/spaces/models/bazaar';
import { AppTile } from 'renderer/components/AppTile';
import { toJS } from 'mobx';
import { observer } from 'mobx-react';
import { lighten, rgba } from 'polished';
import { Reorder, AnimatePresence } from 'framer-motion';
import { useServices } from 'renderer/logic/store';
import { SpacesActions } from 'renderer/logic/actions/spaces';
import { DesktopActions } from 'renderer/logic/actions/desktop';

interface AppDockProps {}

export const AppDock: FC<AppDockProps> = observer(() => {
  const { desktop, spaces, bazaar, theme } = useServices();

  const dividerBg = useMemo(
    () => rgba(lighten(0.2, theme.currentTheme.dockColor), 0.4),
    [theme.currentTheme]
  );

  const spacePath = spaces.selected?.path!;
  const dock = bazaar.getDock(spacePath);

  const orderedList = spacePath ? bazaar.getDockApps(spacePath) : [];

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
        values={orderedList || []}
        onReorder={(newOrder: any) => {
          const newPinList = newOrder.map((app: any) => app.id);
          SpacesActions.setPinnedOrder(spaces.selected!.path, newPinList);
        }}
      >
        {orderedList?.map((app: AppType | any, index: number) => {
          const selected = desktop.isActiveWindow(app.id);
          const open = desktop.isOpenWindow(app.id);
          return (
            <Reorder.Item
              key={`pinned-${app.id}-${spaces.selected?.path}`}
              value={app}
              style={{ zIndex: 1 }}
              initial={{
                opacity: 0.0,
              }}
              animate={{
                opacity: 1,
                transition: {
                  opacity: { duration: 0.25, delay: 0.5 },
                },
              }}
              exit={{
                opacity: 0.5,
                transition: {
                  opacity: { duration: 1, delay: 0 },
                },
              }}
              onClick={(evt: any) => {
                const selectedApp = app;
                if (desktop.isOpenWindow(selectedApp.id)) {
                  DesktopActions.setActive(spacePath, selectedApp.id);
                } else {
                  console.log(selectedApp);
                  DesktopActions.openAppWindow(spacePath, selectedApp);
                }
              }}
              whileDrag={{ zIndex: 20 }}
            >
              <AppTile
                allowContextMenu
                contextPosition="above"
                tileSize="sm"
                isRecommended={false}
                isUninstalled={app.installStatus === InstallStatus.uninstalled}
                isInstalling={
                  app.installStatus === InstallStatus.started ||
                  app.installStatus === InstallStatus.treaty
                }
                app={app}
                selected={selected}
                open={open}
                onAppClick={(evt: any) => {
                  const selectedApp = app;
                  if (desktop.isOpenWindow(selectedApp.id)) {
                    DesktopActions.setActive(spacePath, selectedApp.id);
                  } else {
                    DesktopActions.openAppWindow(spacePath, selectedApp);
                  }
                }}
                contextMenu={[
                  {
                    label: 'Unpin',
                    onClick: (evt: any) => {
                      evt.stopPropagation();
                      SpacesActions.unpinApp(spacePath, app.id);
                    },
                  },
                  {
                    label: 'Close',
                    section: 2,
                    disabled: !open,
                    onClick: (evt: any) => {
                      DesktopActions.closeAppWindow(spacePath, app);
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
    spacePath,
    orderedList,
    dock?.length,
  ]);

  const activeAndUnpinned = desktop.openApps.filter(
    (appWindow: any) =>
      dock && dock.findIndex((pinned: any) => appWindow.id === pinned) === -1
  );

  return (
    <Flex position="relative" flexDirection="row" alignItems="center">
      <AnimatePresence>
        {pinnedApps}
        {activeAndUnpinned.length && orderedList?.length ? (
          <Divider key="app-dock-divider" customBg={dividerBg} ml={2} mr={2} />
        ) : (
          []
        )}
      </AnimatePresence>
      <Flex position="relative" flexDirection="row" gap={8} alignItems="center">
        {activeAndUnpinned.map((unpinnedApp: any) => {
          const app = bazaar.getApp(unpinnedApp.id)!;
          const selected = desktop.isActiveWindow(app.id);
          const open = desktop.isOpenWindow(app.id);
          return (
            <AppTile
              key={`unpinned-${app.id}`}
              allowContextMenu
              contextPosition="above"
              tileSize="sm"
              app={app}
              isRecommended={false}
              selected={selected}
              open={open}
              contextMenu={[
                {
                  label: 'Pin',
                  onClick: (evt: any) => {
                    evt.stopPropagation();
                    SpacesActions.pinApp(spaces.selected?.path!, app.id);
                  },
                },
                {
                  label: 'Close',
                  disabled: !open,
                  section: 2,
                  onClick: (evt: any) => {
                    DesktopActions.closeAppWindow(
                      spaces.selected?.path!,
                      toJS(app)
                    );
                    evt.stopPropagation();
                  },
                },
              ]}
              onAppClick={(selectedApp: any) => {
                if (desktop.isOpenWindow(selectedApp.id)) {
                  if (desktop.isMinimized(selectedApp.id)) {
                    DesktopActions.toggleMinimized(
                      spaces.selected!.path,
                      selectedApp.id
                    );
                  } else {
                    DesktopActions.setActive(
                      spaces.selected!.path,
                      selectedApp.id
                    );
                  }
                } else {
                  DesktopActions.openAppWindow(
                    spaces.selected!.path,
                    JSON.parse(JSON.stringify(selectedApp))
                  );
                }
              }}
            />
          );
        })}
      </Flex>
    </Flex>
  );
});
