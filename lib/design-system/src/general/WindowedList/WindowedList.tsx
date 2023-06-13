import { Ref } from 'react';
import { Virtuoso, VirtuosoHandle, VirtuosoProps } from 'react-virtuoso';

import { SCROLLBAR_WIDTH, WindowedListContainer } from './WindowedList.styles';

export type WindowedListRef = VirtuosoHandle;

type Props<ItemData = any, Context = any> = VirtuosoProps<ItemData, Context> & {
  width?: number;
  height?: number;
  data: ItemData[];
  innerRef?: Ref<WindowedListRef>;
  chatMode?: boolean;
  shiftScrollbar?: boolean;
  hideScrollbar?: boolean;
};

export const WindowedList = <ItemData, Context = any>({
  data,
  innerRef,
  width,
  height,
  chatMode = false,
  shiftScrollbar = false,
  style,
  ...props
}: Props<ItemData, Context>) => (
  <WindowedListContainer>
    <Virtuoso
      ref={innerRef}
      data={data}
      followOutput={chatMode}
      initialTopMostItemIndex={chatMode ? data.length - 1 : 0}
      style={{
        width:
          width ?? shiftScrollbar
            ? `calc(100% + ${SCROLLBAR_WIDTH}px)`
            : '100%',
        height: height ?? '100%',
        marginRight: -(shiftScrollbar ? SCROLLBAR_WIDTH : 0),
        ...style,
      }}
      {...props}
    />
  </WindowedListContainer>
);
