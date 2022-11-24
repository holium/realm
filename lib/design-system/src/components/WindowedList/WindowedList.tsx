import {
  useMemo,
  useRef,
  useCallback,
  RefObject,
  useState,
  useEffect,
} from 'react';
import { ListOnScrollProps, VariableSizeList as List } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import { Box } from '../Box/Box';
import { StyledList } from './WindowedList.styles';

interface WindowedListProps<T> {
  data: T[];
  renderRowElement: (rowData: T, index: number) => JSX.Element;
  innerRef?: RefObject<HTMLDivElement>;
  outerRef?: RefObject<HTMLDivElement>;
  onScroll?: (e: ListOnScrollProps) => void;
  hideScrollbar?: boolean;
  scrollToBottomOnUpdate?: boolean;
  sort?: (a: T, b: T) => number;
  filter?: (rowData: T, index: number) => boolean;
}

export const WindowedList = <T,>({
  data: rawData,
  renderRowElement,
  innerRef,
  outerRef,
  onScroll,
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
  // Used to scroll after the component has mounted, e.g. on new messages.
  const [asyncListRef, setAsyncListRef] = useState<List<any> | null>(null);

  const sizeMap = useRef<Record<number, number>>({});

  const getListItemSize = useCallback(
    (index: number) => sizeMap.current[index] ?? 0,
    []
  );

  useEffect(() => {
    if (scrollToBottomOnUpdate && asyncListRef) {
      asyncListRef?.resetAfterIndex(0);
      asyncListRef?.scrollToItem(data.length - 1, 'end');
    }
  }, [data.length, asyncListRef, scrollToBottomOnUpdate]);

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

  const onListRef = useCallback(
    (listRef: List<any>) => {
      const sizeMapFilled = Object.keys(sizeMap.current).length === data.length;
      if (listRef && sizeMapFilled) {
        listRef.resetAfterIndex(0);
        if (!componentMounted.current) {
          componentMounted.current = true;
          setAsyncListRef(listRef);
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
            innerRef={innerRef}
            outerRef={outerRef}
            width={width}
            height={height}
            itemCount={data.length}
            itemSize={getListItemSize}
            hideScrollbar={hideScrollbar}
            onScroll={onScroll}
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
    </Box>
  );
};

export const useWindowedListRefs = () => {
  const innerRef = useRef<HTMLDivElement>(null);
  const outerRef = useRef<HTMLDivElement>(null);

  return { innerRef, outerRef };
};
