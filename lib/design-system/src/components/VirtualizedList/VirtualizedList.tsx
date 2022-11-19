import { useCallback, useMemo, useRef, useState } from 'react';
import { StyledList, StyledListProps } from './VirtualizedList.styles';
import { Box } from '../Box/Box';
import {
  AutoSizer,
  CellMeasurer,
  CellMeasurerCache,
} from './react-virtualized';

type VirtualizedListProps<T> = {
  data: T[];
  renderRow: (
    rowData: T,
    index: number,
    rerenderList?: () => void
  ) => JSX.Element;
  sort?: (a: T, b: T) => number;
  filter?: (rowData: T, index: number) => boolean;
} & StyledListProps;

export const VirtualizedList = <T,>({
  data,
  renderRow,
  sort = () => 0,
  filter = () => true,
}: VirtualizedListProps<T>) => {
  const [ref, setRef] = useState<any>();
  const filteredAndSortedData = useMemo(
    () => data.filter(filter).sort(sort),
    [data, filter, sort]
  );
  const cache = useRef(
    new CellMeasurerCache({
      fixedWidth: true,
    })
  );

  const rerenderList = useCallback(() => {
    cache.current.clearAll();
    ref.recomputeRowHeights();
  }, [ref]);

  return (
    <Box style={{ width: '100%', height: '100%' }}>
      <AutoSizer>
        {({ width, height }) => (
          <StyledList
            ref={setRef}
            width={width}
            height={height}
            rowHeight={cache.current.rowHeight}
            deferredMeasurementCache={cache.current}
            rowCount={filteredAndSortedData.length}
            rowRenderer={({ key, index, style, parent }) => {
              const rowData = filteredAndSortedData[index];

              return (
                <CellMeasurer
                  key={key}
                  cache={cache.current}
                  parent={parent}
                  rowIndex={index}
                >
                  <div style={style}>
                    {renderRow(rowData, index, rerenderList)}
                  </div>
                </CellMeasurer>
              );
            }}
          />
        )}
      </AutoSizer>
    </Box>
  );
};
