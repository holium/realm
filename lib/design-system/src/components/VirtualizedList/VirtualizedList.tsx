import { useRef } from 'react';
import {
  AutoSizer,
  CellMeasurer,
  CellMeasurerCache,
  List,
} from './react-virtualized';

interface VirtualizedListProps<T> {
  data: T[];
  renderItem: (item: T, index: number) => JSX.Element;
  filter?: (item: T, index: number) => boolean;
}

export const VirtualizedList = <T,>({
  data,
  renderItem,
  filter = () => true,
}: VirtualizedListProps<T>) => {
  const filteredData = data.filter(filter);
  const cache = useRef(
    new CellMeasurerCache({
      fixedWidth: true,
    })
  );

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <AutoSizer>
        {({ width, height }) => (
          <List
            width={width}
            height={height}
            rowHeight={cache.current.rowHeight}
            deferredMeasurementCache={cache.current}
            rowCount={filteredData.length}
            rowRenderer={({ key, index, style, parent }) => {
              const item = filteredData[index];

              return (
                <CellMeasurer
                  key={key}
                  cache={cache.current}
                  parent={parent}
                  columnIndex={0}
                  rowIndex={index}
                >
                  <div style={style}>{renderItem(item, index)}</div>
                </CellMeasurer>
              );
            }}
          />
        )}
      </AutoSizer>
    </div>
  );
};
