import { useEffect, useMemo, useState } from 'react';
import {
  GridContextProvider,
  GridDropZone,
  GridItem,
  swap,
} from 'react-grid-dnd';
import disableScroll from 'disable-scroll';
import { observer } from 'mobx-react';

import { useToggle } from '@holium/design-system';

import { AppMobxType } from 'renderer/stores/models/bazaar.model';
import { useShipStore } from 'renderer/stores/ship.store';

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

  const [items, setItems] = useState(apps);
  const canClick = useToggle(true);

  useEffect(() => {
    window.electron.app.onMouseMove((_position, _state, isDragging) => {
      canClick.setToggle(!isDragging);
    });
  }, []);

  if (!currentSpace) return null;

  const onChange = (
    _sourceId: any,
    sourceIndex: number,
    targetIndex: number
  ) => {
    if (sourceIndex === targetIndex) return;
    bazaarStore.reorderApp(sourceIndex, targetIndex);
    const nextState = swap(items, sourceIndex, targetIndex);
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
          width: maxWidth,
        }}
      >
        {items.map((app, index: number) => {
          const tileId = `${app.id}-${index}-ship-grid-tile`;
          return (
            <GridItem
              id={tileId}
              key={tileId}
              onMouseDownCapture={() => {
                disableScroll.on();
              }}
              onMouseUpCapture={() => {
                disableScroll.off();
              }}
            >
              <GridAppTile
                tileId={tileId}
                tileSize="xl2"
                app={app}
                currentSpace={currentSpace}
                canClick={canClick}
              />
            </GridItem>
          );
        })}
      </GridDropZone>
    </GridContextProvider>
  );
};

export const AppGrid = observer(AppGridPresenter);
