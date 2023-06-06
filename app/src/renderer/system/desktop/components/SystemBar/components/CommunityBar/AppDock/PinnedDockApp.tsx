import { useEffect, useMemo, useRef } from 'react';
import { Reorder } from 'framer-motion';
import { observer } from 'mobx-react-lite';

import {
  AppTile,
  AppTileType,
  bgIsLightOrDark,
  getAppTileFlags,
  useToggle,
} from '@holium/design-system';

import { ContextMenuOption, useContextMenu } from 'renderer/components';
import { useAppState } from 'renderer/stores/app.store';
import {
  AppMobxType,
  InstallStatus,
} from 'renderer/stores/models/bazaar.model';
import { SpaceModelType } from 'renderer/stores/models/spaces.model';
import { useShipStore } from 'renderer/stores/ship.store';
import {
  handleInstallation,
  handleResumeSuspend,
  installLabel,
  resumeSuspendLabel,
} from 'renderer/system/desktop/components/Home/AppInstall/helpers';

type Props = {
  tileId: string;
  app: AppMobxType;
  space?: SpaceModelType;
  hasWindow: boolean;
  isActive: boolean;
  isMinimized: boolean;
  onClick: (app: AppMobxType) => void;
};

export const PinnedDockAppPresenter = ({
  tileId,
  app,
  space,
  hasWindow,
  isActive,
  isMinimized,
  onClick,
}: Props) => {
  const { shellStore } = useAppState();
  const { bazaarStore } = useShipStore();
  const pointerDownRef = useRef<{
    tileId: string;
    rect: DOMRect;
  } | null>(null);
  const { getOptions, setOptions, getColors, setColors, mouseRef } =
    useContextMenu();
  const appRef = bazaarStore.catalog.get(app.id);
  const tapping = useToggle(false);
  // TODO need to cleanup and use a ref for the app here
  const { isSuspended, isUninstalled } = getAppTileFlags(
    (appRef?.installStatus as InstallStatus) || InstallStatus.installed
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
          label: resumeSuspendLabel(appRef?.installStatus as InstallStatus),
          section: 2,
          disabled: false,
          onClick: (evt: any) => {
            evt.stopPropagation();
            return handleResumeSuspend(
              app.id,
              appRef?.installStatus as InstallStatus
            );
          },
        },
      ]
    : [];
  const installOption: ContextMenuOption[] =
    app.type === 'urbit' && isUninstalled
      ? [
          {
            label: installLabel(appRef?.installStatus as InstallStatus),
            // section: 2,
            disabled: false,
            onClick: (evt: any) => {
              evt.stopPropagation();
              const appHost = (app as AppMobxType).host;
              return handleInstallation(
                appHost,
                app.title,
                app.id,
                appRef?.installStatus as InstallStatus
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
    [appRef?.installStatus, isActive, isMinimized]
  );

  const contextMenuColors = useMemo(() => {
    const isLight = bgIsLightOrDark(app.color) === 'light';
    const textColor = isLight
      ? 'rgba(51, 51, 51, 0.8)'
      : 'rgba(255, 255, 255, 0.8)';
    return { textColor, backgroundColor: app.color };
  }, [app.color]);

  useEffect(() => {
    if (!mouseRef) tapping.toggleOff();
  }, [mouseRef]);

  useEffect(() => {
    if (contextMenuOptions !== getOptions(tileId)) {
      setOptions(tileId, contextMenuOptions);
    }

    if (contextMenuColors !== getColors(tileId)) {
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
        onDragStart={() => tapping.toggleOff()}
        drag="x"
        onPointerDown={() => {
          const rect = document.getElementById(tileId)?.getBoundingClientRect();
          if (rect) pointerDownRef.current = { tileId, rect };
          tapping.toggleOn();
        }}
        onPointerUp={(e) => {
          // Make sure it's a left click.
          if (e.button !== 0) return;

          if (tileId !== pointerDownRef.current?.tileId) return;

          tapping.toggleOff();

          const pointerDownRect = pointerDownRef.current?.rect;
          const pointerUpRect = document
            .getElementById(tileId)
            ?.getBoundingClientRect();

          if (!pointerDownRect || !pointerUpRect) return;

          const diffX = Math.abs(pointerDownRect.x - pointerUpRect.x);
          const diffY = Math.abs(pointerDownRect.y - pointerUpRect.y);

          if (diffX === 0 && diffY === 0) onClick(app);
        }}
      >
        <AppTile
          tileId={tileId}
          tileSize="sm"
          installStatus={appRef?.installStatus as InstallStatus}
          app={app as AppTileType}
          isOpen={hasWindow}
          isActive={isActive}
          isAnimated={false}
          tapping={tapping}
        />
      </Reorder.Item>
    ),
    [
      app,
      tileId,
      hasWindow,
      isActive,
      isMinimized,
      appRef?.installStatus,
      onClick,
      tapping.isOn,
    ]
  );
};

export const PinnedDockApp = observer(PinnedDockAppPresenter);
