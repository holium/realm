import { useMemo } from 'react';
import { observer } from 'mobx-react';
import { useShipStore } from 'renderer/stores/ship.store';
import { AppTileSize, Box } from '@holium/design-system';
import { AppMobxType } from 'renderer/stores/models/bazaar.model';
import { AppGridTile } from './GridAppTile';

interface AppGridProps {
  tileSize: AppTileSize;
}

const AppGridPresenter = ({ tileSize = 'xxl' }: AppGridProps) => {
  const { bazaarStore, spacesStore } = useShipStore();
  const currentSpace = spacesStore.selected;
  const apps = useMemo(
    () =>
      [
        ...bazaarStore.installed,
        // ...bazaarStore.devApps,
      ] as AppMobxType[],
    [bazaarStore.catalog]
  );

  if (!currentSpace) return null;

  return (
    <>
      {apps.map((app, index: number) => {
        const tileId = `${app.title}-${index}-ship-grid-tile`;
        return (
          <Box id={tileId} key={tileId}>
            <AppGridTile
              tileId={tileId}
              tileSize={tileSize}
              app={app}
              currentSpace={currentSpace}
              bazaarStore={bazaarStore}
            />
          </Box>
        );
      })}{' '}
    </>
  );
};

export const AppGrid = observer(AppGridPresenter);
