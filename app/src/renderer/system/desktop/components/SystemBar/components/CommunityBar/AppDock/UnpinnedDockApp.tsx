import { AppType } from 'os/services/spaces/models/bazaar';
import { AppTile } from 'renderer/components';
import { useAppState } from 'renderer/stores/app.store';
import { SpaceModelType } from 'renderer/stores/models/spaces.model';

type Props = {
  tileId: string;
  app: AppType;
  space?: SpaceModelType;
  isActive: boolean;
  isMinimized: boolean;
  onClick: (app: AppType) => void;
};

export const UnpinnedDockApp = ({
  tileId,
  app,
  space,
  isActive,
  isMinimized,
  onClick,
}: Props) => {
  const { shellStore } = useAppState();
  return (
    <AppTile
      key={app.id}
      tileId={tileId}
      tileSize="sm"
      app={app}
      isOpen={true}
      isActive={isActive}
      contextMenuOptions={[
        {
          id: `${app.id}-pin}`,
          label: 'Pin',
          onClick: () => {
            space?.pinApp(app.id);
          },
        },
        {
          id: isMinimized ? `${app.id}-show}` : `${app.id}-hide}`,
          label: isMinimized ? 'Show' : 'Hide',
          section: 2,
          onClick: () => shellStore.toggleMinimized(app.id),
        },
        {
          id: `${app.id}-close}`,
          label: 'Close',
          section: 2,
          onClick: () => app && shellStore.closeWindow(app.id),
        },
      ]}
      onAppClick={onClick}
    />
  );
};
