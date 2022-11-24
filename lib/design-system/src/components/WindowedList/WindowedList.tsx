import {
  useMemo,
  useRef,
  useCallback,
  RefObject,
  useState,
  useEffect,
} from 'react';
import {
  List,
  ListType,
  ListOnScrollProps,
  AutoSizer,
} from './WindowedList.styles';
import { Box } from '../Box/Box';

interface WindowedListProps<T> {
  data: T[];
  renderRowElement: (rowData: T, index: number) => JSX.Element;
  // The refs are for parents that want to programmatically scroll the list.
  innerRef?: RefObject<HTMLDivElement>;
  outerRef?: RefObject<HTMLDivElement>;
  hideScrollbar?: boolean;
  scrollToBottomOnUpdate?: boolean;
  onScroll?: (e: ListOnScrollProps) => void;
  sort?: (a: T, b: T) => number;
  filter?: (rowData: T, index: number) => boolean;
}

export const WindowedList = <T,>({
  data: rawData,
  renderRowElement,
  innerRef,
  outerRef,
  hideScrollbar = true,
  scrollToBottomOnUpdate = false,
  onScroll,
  sort = () => 0,
  filter = () => true,
}: WindowedListProps<T>) => {
  const data = useMemo(
    () => rawData.filter(filter).sort(sort),
    [rawData, filter, sort]
  );
  // Used for scrolling after the component has mounted, e.g. on new messages.
  const [asyncListRef, setAsyncListRef] = useState<ListType | null>(null);

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

  const onListRef = useCallback(
    (listRef: ListType) => {
      const sizeMapFilled = Object.keys(sizeMap.current).length === data.length;
      if (listRef && sizeMapFilled) {
        listRef.resetAfterIndex(0);
        if (!asyncListRef) setAsyncListRef(listRef);
      }
    },
    [asyncListRef, data.length]
  );

  useEffect(() => {
    if (asyncListRef && scrollToBottomOnUpdate) {
      // This means the list has been updated
      // and we want to scroll to the bottom.
      asyncListRef.resetAfterIndex(0);
      asyncListRef.scrollToItem(data.length - 1, 'end');
    }
  }, [data.length, asyncListRef, scrollToBottomOnUpdate]);

  return (
    <Box style={{ position: 'relative', width: '100%', height: '100%' }}>
      <AutoSizer>
        {({ height, width }) => (
          <List
            ref={onListRef}
            innerRef={innerRef}
            outerRef={outerRef}
            width={width}
            height={height}
            itemCount={data.length}
            itemSize={getListItemSize}
            onScroll={onScroll}
            hideScrollbar={hideScrollbar}
            initialScrollOffset={scrollToBottomOnUpdate ? -1 : 0}
          >
            {({ index, style }) => (
              <div
                style={{
                  ...style,
                  opacity: !asyncListRef ? 0 : 1,
                }}
              >
                <div ref={(el) => setListItemSize(index, el)}>
                  {renderRowElement(data[index], index)}
                </div>
              </div>
            )}
          </List>
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
