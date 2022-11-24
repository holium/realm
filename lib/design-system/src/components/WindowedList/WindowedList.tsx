import { useMemo, useRef, useCallback } from 'react';
import { VariableSizeList as List } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import { Box } from '../Box/Box';
import { StyledList } from './WindowedList.styles';
import { ElementResizeListener } from './ElementResizeListener';

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
  const componentMounted = useRef(false);

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
        if (index === data.length - 1 && scrollToBottomOnUpdate) {
          ref.scrollIntoView();
        }
      }
    },
    [data.length, scrollToBottomOnUpdate]
  );

  const onListRef = useCallback(
    (listRef: List<any>) => {
      const sizeMapFilled = Object.keys(sizeMap.current).length === data.length;
      if (listRef && sizeMapFilled) {
        listRef.resetAfterIndex(0);
        if (!componentMounted.current) {
          componentMounted.current = true;
          if (scrollToBottomOnUpdate) {
            listRef.scrollToItem(data.length - 1, 'end');
          }
        }
      }
    },
    [data.length, scrollToBottomOnUpdate]
  );

  return (
    <Box style={{ position: 'relative', width: '100%', height: '100%' }}>
      <AutoSizer>
        {({ height, width }) => (
          <StyledList
            ref={onListRef}
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
                  opacity: !componentMounted.current ? 0 : 1,
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
      <ElementResizeListener onResize={() => console.log('resize')} />
    </Box>
  );
};
