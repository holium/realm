import { useMemo } from 'react';
import { observer } from 'mobx-react';

import { Box } from '@holium/design-system/general';

import { AppMobxType } from 'renderer/stores/models/bazaar.model';
import { useShipStore } from 'renderer/stores/ship.store';

import { GridAppTile } from './GridAppTile';

const AppGridPresenter = () => {
  const { bazaarStore, spacesStore } = useShipStore();
  const currentSpace = spacesStore.selected;
  const apps = useMemo(
    () =>
      [
        ...bazaarStore.installed,
        // ...bazaarStore.devApps,
      ] as AppMobxType[],
    [bazaarStore.catalog, bazaarStore.installations.values()]
  );

  if (!currentSpace) return null;

  return (
    <>
      {apps.map((app, index: number) => {
        const tileId = `${app.title}-${index}-ship-grid-tile`;
        return (
          <Box id={tileId} key={tileId}>
            <GridAppTile
              tileId={tileId}
              tileSize="xl2"
              app={app}
              currentSpace={currentSpace}
            />
          </Box>
        );
      })}
    </>
  );
};

export const AppGrid = observer(AppGridPresenter);
