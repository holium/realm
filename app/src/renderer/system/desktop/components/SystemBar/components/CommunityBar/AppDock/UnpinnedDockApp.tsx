import { AppType } from 'os/services/spaces/models/bazaar';
import { AppTile } from 'renderer/components';
import { DesktopActions } from 'renderer/logic/actions/desktop';
import { SpacesActions } from 'renderer/logic/actions/spaces';

type Props = {
  app: AppType;
  spacePath: string;
  isSelected: boolean;
  onClick: (app: AppType) => void;
};

export const UnpinnedDockApp = ({
  app,
  spacePath,
  isSelected,
  onClick,
}: Props) => {
  const tileId = `unpinned-${app.id}`;

  return (
    <AppTile
      tileId={tileId}
      tileSize="sm"
      app={app}
      open={true}
      selected={isSelected}
      contextMenuOptions={[
        {
          id: `${app.id}-pin}`,
          label: 'Pin',
          onClick: () => {
            SpacesActions.pinApp(spacePath, app.id);
          },
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
};
