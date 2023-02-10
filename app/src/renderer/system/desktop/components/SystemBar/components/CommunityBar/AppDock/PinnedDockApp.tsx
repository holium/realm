import { useRef } from 'react';
import { Reorder } from 'framer-motion';
import {
  AppType,
  InstallStatus,
  UrbitAppType,
} from 'os/services/spaces/models/bazaar';
import { AppTile, ContextMenuOption } from 'renderer/components';
import { DesktopActions } from 'renderer/logic/actions/desktop';
import { SpacesActions } from 'renderer/logic/actions/spaces';
import { getAppTileFlags } from 'renderer/logic/lib/app';
import {
  resumeSuspendLabel,
  handleResumeSuspend,
  installLabel,
  handleInstallation,
} from 'renderer/system/desktop/components/Home/AppInstall/helpers';

type Props = {
  tileId: string;
  app: AppType;
  spacePath: string;
  isOpen: boolean;
  isSelected: boolean;
  onClick: (app: AppType) => void;
};

export const PinnedDockApp = ({
  tileId,
  app,
  spacePath,
  isOpen,
  isSelected,
  onClick,
}: Props) => {
  const pointerDownRef = useRef<{
    tileId: string;
    rect: DOMRect;
  } | null>(null);

  const { isSuspended, isUninstalled } = getAppTileFlags(
    (app.installStatus as InstallStatus) || InstallStatus.installed
  );

  const unpinOption: ContextMenuOption[] = [
    {
      id: `${app.id}-unpin}`,
      label: 'Unpin',
      onClick: () => {
        SpacesActions.unpinApp(spacePath, app.id);
      },
    },
  ];
  const closeOption: ContextMenuOption[] = [
    {
      id: `${app.id}-close}`,
      label: 'Close',
      section: 2,
      disabled: !Boolean(window),
      onClick: () => DesktopActions.closeAppWindow(app.id),
    },
  ];
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

  return (
    <Reorder.Item
      value={app}
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
        app={app}
        open={isOpen}
        selected={isSelected}
        isAnimated={
          app.installStatus !== InstallStatus.suspended &&
          app.installStatus !== InstallStatus.failed
        }
        contextMenuOptions={[
          ...installOption,
          ...suspendOption,
          ...unpinOption,
          ...closeOption,
        ]}
      />
    </Reorder.Item>
  );
};
