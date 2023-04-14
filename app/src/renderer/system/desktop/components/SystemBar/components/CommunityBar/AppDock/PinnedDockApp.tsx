import { useRef, useMemo, useEffect } from 'react';
import { Reorder } from 'framer-motion';
import { ContextMenuOption, useContextMenu } from 'renderer/components';
import {
  AppTile,
  AppTileType,
  bgIsLightOrDark,
  getAppTileFlags,
  InstallStatus,
} from '@holium/design-system';
import {
  resumeSuspendLabel,
  handleResumeSuspend,
  installLabel,
  handleInstallation,
} from 'renderer/system/desktop/components/Home/AppInstall/helpers';
import { useAppState } from 'renderer/stores/app.store';
import { SpaceModelType } from 'renderer/stores/models/spaces.model';
import { AppMobxType } from 'renderer/stores/models/bazaar.model';

type Props = {
  tileId: string;
  app: AppMobxType;
  space?: SpaceModelType;
  hasWindow: boolean;
  isActive: boolean;
  isMinimized: boolean;
  onClick: (app: AppMobxType) => void;
};

export const PinnedDockApp = ({
  tileId,
  app,
  space,
  hasWindow,
  isActive,
  isMinimized,
  onClick,
}: Props) => {
  const { shellStore } = useAppState();
  const pointerDownRef = useRef<{
    tileId: string;
    rect: DOMRect;
  } | null>(null);
  const { getOptions, setOptions, getColors, setColors } = useContextMenu();

  const { isSuspended, isUninstalled } = getAppTileFlags(
    (app.installStatus as InstallStatus) || InstallStatus.installed
  );

  const unpinOption: ContextMenuOption[] = [
    {
      id: `${app.id}-unpin}`,
      label: 'Unpin',
      onClick: () => {
        space?.unpinApp(app.id);
      },
    },
  ];
  const hideOrShowOption: ContextMenuOption[] = hasWindow
    ? [
        {
          id: isMinimized ? `${app.id}-show}` : `${app.id}-hide}`,
          label: isMinimized ? 'Show' : 'Hide',
          section: 2,
          onClick: () => shellStore.toggleMinimized(app.id),
        },
      ]
    : [];
  const closeOption: ContextMenuOption[] = hasWindow
    ? [
        {
          id: `${app.id}-close}`,
          label: 'Close',
          section: 2,
          onClick: () => shellStore.closeWindow(app.id),
        },
      ]
    : [];
  const suspendOption: ContextMenuOption[] = isSuspended
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
  const installOption: ContextMenuOption[] =
    app.type === 'urbit' && isUninstalled
      ? [
          {
            label: installLabel(app.installStatus as InstallStatus),
            // section: 2,
            disabled: false,
            onClick: (evt: any) => {
              evt.stopPropagation();
              const appHost = (app as AppMobxType).host;
              return handleInstallation(
                appHost,
                app.id,
                app.installStatus as InstallStatus
              );
            },
          },
        ]
      : [];

  const contextMenuOptions = useMemo(
    () => [
      ...installOption,
      ...suspendOption,
      ...unpinOption,
      ...hideOrShowOption,
      ...closeOption,
    ],
    []
  );

  const contextMenuColors = useMemo(() => {
    const isLight = bgIsLightOrDark(app.color) === 'light';
    const textColor = isLight
      ? 'rgba(51, 51, 51, 0.8)'
      : 'rgba(255, 255, 255, 0.8)';
    return { textColor, backgroundColor: app.color };
  }, [app.color]);

  useEffect(() => {
    if (contextMenuOptions && contextMenuOptions !== getOptions(tileId)) {
      setOptions(tileId, contextMenuOptions);
    }

    if (contextMenuColors && contextMenuColors !== getColors(tileId)) {
      setColors(tileId, contextMenuColors);
    }
  }, [
    contextMenuColors,
    contextMenuOptions,
    getColors,
    getOptions,
    setColors,
    setOptions,
    tileId,
  ]);

  return useMemo(
    () => (
      <Reorder.Item
        key={app.id}
        value={app.id}
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

          if (diffX < 5 && diffY < 5) onClick(app);
        }}
      >
        <AppTile
          tileId={tileId}
          tileSize="sm"
          installStatus={app.installStatus as InstallStatus}
          app={app as AppTileType}
          isOpen={hasWindow}
          isActive={isActive}
          isAnimated={
            app.installStatus !== InstallStatus.suspended &&
            app.installStatus !== InstallStatus.failed
          }
        />
      </Reorder.Item>
    ),
    [app, tileId, hasWindow, isActive, isMinimized, onClick]
  );
};
