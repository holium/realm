import { useMemo, useRef } from 'react';
import { Box } from '../Box/Box';
import AutoSizer from './source/AutoSizer/AutoSizer';
import CellMeasurer from './source/CellMeasurer/CellMeasurer';
import CellMeasurerCache from './source/CellMeasurer/CellMeasurerCache';
import { Scroll } from './source/List/types';
import List from './source/List/List';

type WindowedListProps<T> = {
  data: T[];
  rowRenderer: (rowData: T, index: number, measure: () => void) => JSX.Element;
  /**
   * The width of the list. If undefined, the list will auto-size to the width of its parent container.
   * It is preferred to set this value if known ahead of time, to save render time.
   */
  width?: number;
  /**
   * The height of the list. If undefined, the list will auto-size to the height of its parent container.
   * It is preferred to set this value if known ahead of time, to save render time.
   */
  height?: number;
  /**
   * The height of the row. If undefined, the row will auto-size to the height of its parent container.
   * It is preferred to set this value if known ahead of time, to save render time.
   */
  rowHeight?: number;
  onScroll?: (params: Scroll) => void;
  hideScrollbar?: boolean;
  startAtBottom?: boolean;
  sort?: (a: T, b: T) => number;
  filter?: (rowData: T, index: number) => boolean;
};

export const WindowedList = <T,>({
  data: rawData,
  rowRenderer,
  width,
  height,
  rowHeight,
  onScroll,
  hideScrollbar = true,
  startAtBottom = false,
  sort = () => 0,
  filter = () => true,
}: WindowedListProps<T>) => {
  const data = useMemo(
    () => rawData.filter(filter).sort(sort),
    [rawData, filter, sort]
  );
  const cache = useRef(
    new CellMeasurerCache({
      fixedWidth: true,
      minWidth: width,
      defaultWidth: width,
      minHeight: rowHeight,
      defaultHeight: rowHeight,
    })
  );

  return (
    <Box style={{ width: '100%', height: '100%' }}>
      <AutoSizer
        defaultWidth={width}
        defaultHeight={height}
        disableWidth={Boolean(width)}
        disableHeight={Boolean(height)}
      >
        {({ width: maybeAutoWidth, height: maybeAutoHeight }) => (
          <List
            width={width ?? maybeAutoWidth}
            height={height ?? maybeAutoHeight}
            rowCount={data.length}
            rowHeight={cache.current.rowHeight as any}
            deferredMeasurementCache={cache.current}
            rowRenderer={({ key, index, style, parent }) => (
              <CellMeasurer
                key={key}
                cache={cache.current}
                parent={parent}
                rowIndex={index}
              >
                {({ measure, registerChild }) => (
                  <div style={style} ref={registerChild}>
                    {rowRenderer(data[index], index, measure)}
                  </div>
                )}
              </CellMeasurer>
            )}
            onScroll={onScroll}
            startAtBottom={startAtBottom}
            scrollToIndex={startAtBottom ? data.length - 1 : 0}
            scrollToAlignment={startAtBottom ? 'end' : 'auto'}
            className={hideScrollbar ? 'hide-scrollbar' : ''}
          />
        )}
      </AutoSizer>
    </Box>
  );
};
