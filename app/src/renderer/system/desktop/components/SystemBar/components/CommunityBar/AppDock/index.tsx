import { useCallback, useEffect, useRef, useState } from 'react';
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
import { debounce } from 'lodash';
import { WindowModelType } from 'os/services/shell/desktop.model';

const AppDockPresenter = () => {
  const { desktop, spaces, bazaar, theme } = useServices();

  const spacePath = spaces.selected?.path;
  const dock = spacePath ? bazaar.getDock(spacePath) ?? [] : [];
  const dockApps = spacePath
    ? ((bazaar.getDockApps(spacePath) ?? []) as AppType[])
    : [];

  const [localDockApps, setLocalDockApps] = useState<AppType[]>(dockApps);

  const pointerDownRef = useRef<{
    tileId: string;
    rect: DOMRect;
  } | null>(null);

  const debouncedSetLocalDockApps = useCallback(
    debounce(setLocalDockApps, 500),
    []
  );

  useEffect(() => {
    // If the dock length changes, e.g. from the AppGrid, we update the local dock.
    debouncedSetLocalDockApps(dockApps);
  }, [dockApps.length]);

  if (!spacePath) return null;

  const onClickDockedApp = (dockedApp: AppType) => {
    const window = desktop.getWindowByAppId(dockedApp.id);
    if (window) {
      if (window.isMinimized) {
        DesktopActions.toggleMinimized(dockedApp.id);
      } else {
        DesktopActions.setActive(dockedApp.id);
      }
    } else {
      DesktopActions.openAppWindow(toJS(dockedApp));
    }
  };

  const pinnedApps = localDockApps?.map((app: AppType | undefined, index) => {
    if (!app) return null;
    const selected = desktop.getWindowByAppId(app.id)?.isActive;
    const open = Boolean(desktop.getWindowByAppId(app.id));
    const { isSuspended, isUninstalled } = getAppTileFlags(
      (app.installStatus as InstallStatus) || InstallStatus.installed
    );
    const suspendRow = isSuspended
      ? [
          {
            label: resumeSuspendLabel(app.installStatus as InstallStatus),
            section: 2,
            disabled: false,
            onClick: (evt: any) => {
              evt.stopPropagation();
              return handleResumeSuspend(
                app.id,
                app.installStatus as InstallStatus
              );
            },
          },
        ]
      : [];

    const installRow =
      app.type === 'urbit' && isUninstalled
        ? [
            {
              label: installLabel(app.installStatus as InstallStatus),
              // section: 2,
              disabled: false,
              onClick: (evt: any) => {
                evt.stopPropagation();
                const appHost = (app as UrbitAppType).host;
                return handleInstallation(
                  appHost,
                  app.id,
                  app.installStatus as InstallStatus
                );
              },
            },
          ]
        : [];
    const tileId = `pinned-${app.id}-${spacePath}-${index}`;

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
          const rect = document.getElementById(tileId)?.getBoundingClientRect();
          if (rect) pointerDownRef.current = { tileId, rect };
        }}
        onPointerUp={(e) => {
          // Make sure it's a left click.
          if (e.button !== 0) return;

          if (tileId !== pointerDownRef.current?.tileId) return;

          const pointerDownRect = pointerDownRef.current?.rect;
          const pointerUpRect = document
            .getElementById(tileId)
            ?.getBoundingClientRect();

          if (!pointerDownRect || !pointerUpRect) return;

          // < 5px movement is a click
          const diffX = Math.abs(pointerDownRect.x - pointerUpRect.x);
          const diffY = Math.abs(pointerDownRect.y - pointerUpRect.y);

          if (diffX < 5 && diffY < 5) onClickDockedApp(app);
        }}
      >
        <AppTile
          tileId={tileId}
          tileSize="sm"
          installStatus={app.installStatus as InstallStatus}
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
              onClick: () => DesktopActions.closeAppWindow(app.id),
            },
          ]}
        />
      </Reorder.Item>
    );
  });

  const unpinnedApps = desktop.openWindows
    .filter(
      (appWindow: WindowModelType) =>
        dock.findIndex((pinned) => appWindow.appId === pinned) === -1
    )
    .map((unpinnedAppWindow: WindowModelType, index) => {
      const appId = unpinnedAppWindow.appId;
      const app = bazaar.getApp(appId);
      const tileId = `unpinned-${appId}-${index}`;

      if (!app) return null;

      return (
        <AppTile
          key={tileId}
          tileId={tileId}
          tileSize="sm"
          app={app}
          open={true}
          selected={unpinnedAppWindow.isActive}
          contextMenuOptions={[
            {
              id: `${appId}-pin}`,
              label: 'Pin',
              onClick: () => {
                SpacesActions.pinApp(spacePath, appId);
              },
            },
            {
              id: `${appId}-close}`,
              label: 'Close',
              section: 2,
              onClick: () => app && DesktopActions.closeAppWindow(app.id),
            },
          ]}
          onAppClick={onClickDockedApp}
        />
      );
    });

  return (
    <Flex position="relative" flexDirection="row" alignItems="center">
      <AnimatePresence>
        <Reorder.Group
          axis="x"
          style={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'row',
            gap: 8,
          }}
          values={localDockApps || []}
          onReorder={(newOrder: AppType[]) => {
            // First we update the dock locally so the user doesn't have to
            // wait for the subscription to come back.
            setLocalDockApps(newOrder);
            const newPinList = newOrder.map((app) => app.id);
            SpacesActions.setPinnedOrder(spacePath, newPinList);
          }}
        >
          {pinnedApps}
        </Reorder.Group>

        {Boolean(unpinnedApps.length && localDockApps?.length) && (
          <Divider
            key={`app-dock-divider-${spacePath}`}
            customBg={rgba(lighten(0.2, theme.currentTheme.dockColor), 0.4)}
            ml={2}
            mr={2}
          />
        )}
      </AnimatePresence>
      <Flex position="relative" flexDirection="row" gap={8} alignItems="center">
        {unpinnedApps}
      </Flex>
    </Flex>
  );
};

export const AppDock = observer(AppDockPresenter);
