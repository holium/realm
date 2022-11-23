import { useEffect, useMemo, useRef, useCallback } from 'react';
import { VariableSizeList as List } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import { Box } from '../Box/Box';
import { StyledList } from './WindowedList.styles';

interface WindowedListProps<T> {
  data: T[];
  renderRowElement: (rowData: T, index: number) => JSX.Element;
  hideScrollbar?: boolean;
  scrollToBottomOnUpdate?: boolean;
  sort?: (a: T, b: T) => number;
  filter?: (rowData: T, index: number) => boolean;
}

export const WindowedList = <T,>({
  data: rawData,
  renderRowElement,
  hideScrollbar = true,
  scrollToBottomOnUpdate = false,
  sort = () => 0,
  filter = () => true,
}: WindowedListProps<T>) => {
  const data = useMemo(
    () => rawData.filter(filter).sort(sort),
    [rawData, filter, sort]
  );
  const renderFinished = useRef(false);

  const listRef = useRef<List<any>>(null);
  const sizeMap = useRef<Record<number, number>>({});

  const getListItemSize = useCallback(
    (index: number) => sizeMap.current[index] ?? 0,
    []
  );

  const setListItemSize = useCallback(
    (index: number, ref: HTMLDivElement | null) => {
      if (ref && !sizeMap.current[index]) {
        sizeMap.current = {
          ...sizeMap.current,
          [index]: ref.getBoundingClientRect().height,
        };
      }
    },
    []
  );

  const scrollToBottom = useCallback(
    () => listRef.current?.scrollToItem(data.length - 1, 'end'),
    [data.length]
  );

  useEffect(() => {
    // Scroll to bottom if the list is updated (e.g. new message).
    if (scrollToBottomOnUpdate) scrollToBottom();
  }, [data.length, scrollToBottom, scrollToBottomOnUpdate]);

  useEffect(() => {
    // On mount we poll 1-2 times until the DOM is loaded
    // and we can refresh the list heights cache and scroll to botttom.
    const interval = setInterval(() => {
      const sizeMapFilled = Object.keys(sizeMap.current).length === data.length;
      const listRefCurrent = listRef.current;
      if (sizeMapFilled && listRefCurrent) {
        listRefCurrent.resetAfterIndex(0);
        if (scrollToBottomOnUpdate) scrollToBottom();
        renderFinished.current = true;
        clearInterval(interval);
      }
    }, 10);
    return () => clearInterval(interval);
  }, [data.length, scrollToBottom, scrollToBottomOnUpdate]);

  return (
    <Box style={{ position: 'relative', width: '100%', height: '100%' }}>
      <AutoSizer>
        {({ height, width }) => (
          <StyledList
            ref={listRef}
            width={width}
            height={height}
            itemCount={data.length}
            itemSize={getListItemSize}
            hideScrollbar={hideScrollbar}
          >
            {({ index, style }) => (
              <div
                style={{
                  ...style,
                  opacity: !renderFinished.current ? 0 : 1,
                }}
              >
                <div ref={(el) => setListItemSize(index, el)}>
                  {renderRowElement(data[index], index)}
                </div>
              </div>
            )}
          </StyledList>
        )}
      </AutoSizer>
    </Box>
  );
};
