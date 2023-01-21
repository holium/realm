import { useMemo, useRef, useState } from 'react';
import { Flex, Divider } from 'renderer/components';
import {
  AppType,
  InstallStatus,
  UrbitAppType,
} from 'os/services/spaces/models/bazaar';
import { AppTile } from 'renderer/components/AppTile';
import { toJS } from 'mobx';
import { observer } from 'mobx-react';
import { lighten, rgba } from 'polished';
import { Reorder, AnimatePresence } from 'framer-motion';
import { useServices } from 'renderer/logic/store';
import { SpacesActions } from 'renderer/logic/actions/spaces';
import { DesktopActions } from 'renderer/logic/actions/desktop';
import { getAppTileFlags } from 'renderer/logic/lib/app';
import {
  handleInstallation,
  handleResumeSuspend,
  installLabel,
  resumeSuspendLabel,
} from 'renderer/system/desktop/components/Home/AppInstall/helpers';

export const AppDock = observer(() => {
  const { desktop, spaces, bazaar, theme } = useServices();

  const dividerBg = useMemo(
    () => rgba(lighten(0.2, theme.currentTheme.dockColor), 0.4),
    [theme.currentTheme]
  );

  const spacePath = spaces.selected?.path!;
  const dock = bazaar.getDock(spacePath);

  const startBounds = useRef<DOMRect>();
  const [orderedList, setOrderedList] = useState(
    spacePath ? (bazaar.getDockApps(spacePath) as AppType[]) : []
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
        values={orderedList || []}
        onReorder={(newOrder: AppType[]) => {
          // First we update the dock locally so the user doesn't have to
          // wait for the subscription to come back.
          setOrderedList(newOrder);
          const newPinList = newOrder.map((app) => app.id);
          SpacesActions.setPinnedOrder(spaces.selected!.path, newPinList);
        }}
      >
        {orderedList?.map((app: AppType | any) => {
          const selected = desktop.isActiveWindow(app.id);
          const open = desktop.isOpenWindow(app.id);
          const { isSuspended, isUninstalled } = getAppTileFlags(
            app.installStatus || InstallStatus.installed
          );
          const suspendRow = isSuspended
            ? [
                {
                  label: resumeSuspendLabel(app.installStatus),
                  section: 2,
                  disabled: false,
                  onClick: (evt: any) => {
                    evt.stopPropagation();
                    return handleResumeSuspend(app.id, app.installStatus);
                  },
                },
              ]
            : [];

          const installRow =
            app.type === 'urbit' && isUninstalled
              ? [
                  {
                    label: installLabel(app.installStatus),
                    // section: 2,
                    disabled: false,
                    onClick: (evt: any) => {
                      evt.stopPropagation();
                      const appHost = (app as UrbitAppType).host;
                      return handleInstallation(
                        appHost,
                        app.id,
                        app.installStatus
                      );
                    },
                  },
                ]
              : [];
          const tileId = `pinned-${app.id}-${spaces.selected?.path}`;
          const onClick = () => {
            if (desktop.isOpenWindow(app.id)) {
              DesktopActions.setActive(spacePath, app.id);
            } else {
              DesktopActions.openAppWindow(spacePath, app);
            }
          };

          return (
            <Reorder.Item
              key={tileId}
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
              whileDrag={{ zIndex: 20 }}
              onPointerDown={() => {
                startBounds.current = document
                  .getElementById(tileId)
                  ?.getBoundingClientRect();
              }}
              onPointerUp={(e) => {
                // If the tile's bounds haven't changed, we can assume it's
                // been clicked and not dragged.
                if (e.button !== 0) return;

                const endBounds = document
                  .getElementById(tileId)
                  ?.getBoundingClientRect();

                if (!endBounds || !startBounds.current) return;

                const diffX = Math.abs(startBounds.current.x - endBounds.x);
                const diffY = Math.abs(startBounds.current.y - endBounds.y);

                if (diffX < 5 && diffY < 5) onClick();
              }}
            >
              <AppTile
                tileId={tileId}
                tileSize="sm"
                installStatus={app.installStatus}
                isAnimated={
                  app.installStatus !== InstallStatus.suspended &&
                  app.installStatus !== InstallStatus.failed
                }
                app={app}
                selected={selected}
                open={open}
                contextMenuOptions={[
                  ...installRow,
                  ...suspendRow,
                  {
                    id: `${app.id}-unpin}`,
                    label: 'Unpin',
                    onClick: () => {
                      SpacesActions.unpinApp(spacePath, app.id);
                    },
                  },
                  {
                    id: `${app.id}-close}`,
                    label: 'Close',
                    section: 2,
                    disabled: !open,
                    onClick: () => {
                      DesktopActions.closeAppWindow(spacePath, app);
                    },
                  },
                ]}
              />
            </Reorder.Item>
          );
        })}
      </Reorder.Group>
    );
  }, [desktop, orderedList, spacePath, spaces.selected]);

  const activeAndUnpinned = useMemo(
    () =>
      desktop.openApps.filter(
        (appWindow: any) =>
          dock &&
          dock.findIndex((pinned: any) => appWindow.id === pinned) === -1
      ),
    [desktop.openApps, dock]
  );

  const activeAndUnpinnedApps = useMemo(
    () => (
      <Flex position="relative" flexDirection="row" gap={8} alignItems="center">
        {activeAndUnpinned.map((unpinnedApp: any) => {
          const app = bazaar.getApp(unpinnedApp.id)!;
          const selected = desktop.isActiveWindow(app.id);
          const open = desktop.isOpenWindow(app.id);
          const tileId = `unpinned-${app.id}`;
          return (
            <AppTile
              key={tileId}
              tileId={tileId}
              tileSize="sm"
              app={app}
              selected={selected}
              open={open}
              contextMenuOptions={[
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
    ),
    [activeAndUnpinned, bazaar, desktop, spaces.selected]
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
      {activeAndUnpinnedApps}
    </Flex>
  );
});
