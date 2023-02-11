import { AppType } from 'os/services/spaces/models/bazaar';
import { AppTile } from 'renderer/components';
import { DesktopActions } from 'renderer/logic/actions/desktop';
import { SpacesActions } from 'renderer/logic/actions/spaces';

type Props = {
  tileId: string;
  app: AppType;
  spacePath: string;
  isActive: boolean;
  isMinimized: boolean;
  onClick: (app: AppType) => void;
};

export const UnpinnedDockApp = ({
  tileId,
  app,
  spacePath,
  isActive,
  isMinimized,
  onClick,
}: Props) => (
  <AppTile
    key={app.id}
    tileId={tileId}
    tileSize="sm"
    app={app}
    open={true}
    selected={isActive}
    contextMenuOptions={[
      {
        id: `${app.id}-pin}`,
        label: 'Pin',
        onClick: () => {
          SpacesActions.pinApp(spacePath, app.id);
        },
      },
      {
        id: isMinimized ? `${app.id}-show}` : `${app.id}-hide}`,
        label: isMinimized ? 'Show' : 'Hide',
        section: 2,
        onClick: () => DesktopActions.toggleMinimized(app.id),
      },
      {
        id: `${app.id}-close}`,
        label: 'Close',
        section: 2,
        onClick: () => app && DesktopActions.closeAppWindow(app.id),
      },
    ]}
    onAppClick={onClick}
  />
);
