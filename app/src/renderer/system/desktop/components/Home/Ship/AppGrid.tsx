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
        // ...(currentSpace?.bookmarks ?? []),
        // ...bazaarStore.devApps,
      ] as AppMobxType[],
    [
      bazaarStore.catalog,
      bazaarStore.installations.values(),
      currentSpace?.bookmarks,
    ]
  );

  const [items, setItems] = useState(apps);
  const canClick = useToggle(true);

  // TODO: we should remove this listener when the component unmounts
  // or find a more efficient way to get if the user is dragging
  useEffect(() => {
    window.electron.app.onMouseMove((position, state, isDragging) => {
      canClick.setToggle(!isDragging);
    });
  }, []);

  if (!currentSpace) return null;

  const onChange = (_, sourceIndex, targetIndex) => {
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
          // overflow: 'hidden',
          width: maxWidth,
        }}
      >
        {items.map((app, index: number) => {
          // console.log(app);
          // this is messy.  TODO consolidate devapps, pins, and installed apps into one component.
          // if (app.hasOwnProperty('url')) {
          //   const tileId = `appgrid-${index}-pinned-${app.url}`;
          //   return (
          //     <GridItem
          //       id={tileId}
          //       key={tileId}
          //       onMouseDownCapture={() => {
          //         disableScroll.on();
          //       }}
          //       onMouseUpCapture={() => {
          //         disableScroll.off();
          //       }}
          //     >
          //       <PinnedWebApp
          //         key={`appgrid-${index}-pinned-${app.url}`}
          //         canClick={canClick}
          //         {...app}
          //         isGrid
          //       />
          //     </GridItem>
          //   );
          // } else {
          const tileId = `${app.title}-${index}-ship-grid-tile`;
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
