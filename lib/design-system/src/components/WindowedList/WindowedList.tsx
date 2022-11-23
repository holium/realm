import { useMemo, useRef, useCallback, useEffect } from 'react';
import { VariableSizeList as List } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import { Box } from '../Box/Box';
import { WindowedRow } from './WindowedRow';
import { StyledList } from './WindowedList.styles';

interface WindowedListProps<T> {
  data: T[];
  renderRowElement: (rowData: T, index: number) => JSX.Element;
  hideScrollbar?: boolean;
  scrollToBottomOnChange?: boolean;
  startAtBottom?: boolean;
  sort?: (a: T, b: T) => number;
  filter?: (rowData: T, index: number) => boolean;
}

export const WindowedList = <T,>({
  data: rawData,
  renderRowElement,
  hideScrollbar = true,
  scrollToBottomOnChange = false,
  startAtBottom = false,
  sort = () => 0,
  filter = () => true,
}: WindowedListProps<T>) => {
  const data = useMemo(
    () => rawData.filter(filter).sort(sort),
    [rawData, filter, sort]
  );

  const listRef = useRef<List<any>>(null);
  const sizeMap = useRef<Record<number, number>>({});
  const setSize = useCallback((index: number, size: number) => {
    sizeMap.current = { ...sizeMap.current, [index]: size };
    listRef.current?.resetAfterIndex(index);
  }, []);
  const getSize = (index: number) => sizeMap.current[index] || 50;
  const listItemsHeight = useMemo(
    () => data.reduce((acc, _, index) => acc + getSize(index), 0),
    [data, getSize]
  );

  const scrollToBottom = useCallback(() => {
    listRef.current?.scrollToItem(data.length - 1);
  }, [data.length]);

  useEffect(() => {
    if (scrollToBottomOnChange) scrollToBottom();
  });

  useEffect(() => {
    if (scrollToBottomOnChange) scrollToBottom();
  }, [scrollToBottom, scrollToBottomOnChange]);

  return (
    <Box style={{ position: 'relative', width: '100%', height: '100%' }}>
      <AutoSizer>
        {({ height: containerHeight, width: containerWidth }) => {
          let marginTop = 0;
          let listHeight = containerHeight;

          if (startAtBottom) {
            // If the list is shorter than the container, we want to start at the bottom
            // and have the list grow upwards.
            if (listItemsHeight < containerHeight) {
              marginTop = containerHeight - listItemsHeight;
              listHeight = listItemsHeight;
            }
          }

          return (
            <StyledList
              ref={listRef}
              width={containerWidth}
              height={listHeight}
              itemCount={data.length}
              itemSize={getSize}
              hideScrollbar={hideScrollbar}
              style={{
                marginTop,
              }}
            >
              {({ index, style }) => (
                <div style={style}>
                  <WindowedRow index={index} setSize={setSize}>
                    {renderRowElement(data[index], index)}
                  </WindowedRow>
                </div>
              )}
            </StyledList>
          );
        }}
      </AutoSizer>
    </Box>
  );
};
