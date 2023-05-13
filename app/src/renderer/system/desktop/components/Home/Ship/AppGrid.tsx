import { useEffect, useMemo, useState } from 'react';
import { GridContextProvider, GridDropZone, swap } from 'react-grid-dnd';
import { observer } from 'mobx-react';

import { useToggle } from '@holium/design-system';
import { Box } from '@holium/design-system/general';

import { AppMobxType } from 'renderer/stores/models/bazaar.model';
import { useShipStore } from 'renderer/stores/ship.store';

import { PinnedWebApp } from '../../SystemBar/components/CommunityBar/AppDock/PinnedWebApp';
import { GridAppTile } from './GridAppTile';

interface AppGridProps {
  maxWidth: number;
}

const AppGridPresenter = ({ maxWidth }: AppGridProps) => {
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

  const bookmarks = useMemo(
    () => currentSpace?.bookmarks ?? [],
    [currentSpace?.bookmarks]
  );

  const [items, setItems] = useState([...apps, ...bookmarks]);
  const canClick = useToggle(true);

  // TODO: we should remove this listener when the component unmounts
  // or find a more efficient way to get if the user is dragging
  useEffect(() => {
    window.electron.app.onMouseMove((position, state, isDragging) => {
      canClick.setToggle(!isDragging);
    });
  }, []);

  if (!currentSpace) return null;

  const onChange = (sourceId, sourceIndex, targetIndex) => {
    console.log('onChange', sourceId, sourceIndex, targetIndex);
    const nextState = swap(apps, sourceIndex, targetIndex);
    console.log(nextState);
    setItems(nextState);
  };

  return (
    <GridContextProvider onChange={onChange}>
      <GridDropZone
        id="items"
        boxesPerRow={4}
        rowHeight={maxWidth / 4}
        style={{
          height: (maxWidth / 4) * Math.ceil(apps.length / 4),
          // overflow: 'hidden',
          width: maxWidth,
        }}
      >
        {items.map((app, index: number) => {
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
        {bookmarks.map((bookmark, index) => (
          <PinnedWebApp
            key={`appgrid-${index}-pinned-${bookmark.url}`}
            {...bookmark}
            isGrid
          />
        ))}
      </GridDropZone>
    </GridContextProvider>
  );
};

export const AppGrid = observer(AppGridPresenter);
